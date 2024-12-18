
use grebi_shared::get_id;
use rusqlite::Statement;
use rusqlite::ToSql;
use std::io::BufReader;
use std::io::BufRead;
use std::io::StdinLock;
use std::io;
use std::io::Write;
use clap::Parser;

use rusqlite::{params, Connection, Transaction};

use grebi_shared::json_lexer::{JsonTokenType};
use lz4::{EncoderBuilder};

#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

#[derive(clap::Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {

    #[arg(long)]
    db_path: String,

    #[arg(long)]
    compression_level: u32,

    #[arg(long)]
    batch_size: usize
}

fn insert(
    stmt_batch:&mut Statement,
    stmt_single:&mut Statement,
    reader:&mut BufReader<StdinLock<>>,
    compression_level:u32,
    batch_size:usize) {

    let start_time = std::time::Instant::now();


    let mut n:i64 = 0;
    let mut param_stack: Vec<_> = Vec::new();

    loop {

        let mut line:Vec<u8> = Vec::new();
        reader.read_until(b'\n', &mut line).unwrap();

        if line.len() == 0 {
            eprintln!("saw {} subjects", n);
            break;
        }

        let id = {
            let tmp_id = get_id(&line);
            tmp_id.to_owned()
        };

        let compressed =  {
            let mut enc = lz4::EncoderBuilder::new().level(compression_level).build(Vec::new()).unwrap();
            enc.write(&line).unwrap();
            let (v, r) = enc.finish();
            r.unwrap();
            v
        };

        param_stack.push(id);
        param_stack.push(compressed);

        if param_stack.len() == 2*batch_size {
            stmt_batch.execute(rusqlite::params_from_iter(param_stack.iter())).unwrap();
            param_stack.clear();
        }

        n = n + 1;

        if n % 1000000 == 0 {
            eprintln!("{}", n);
        }
    }

    // insert the last ones if we didn't reach batch size
    if param_stack.len() > 0 {
        let mut i = 0;
        while i < param_stack.len() {
            let id = &param_stack[i];
            let val = &param_stack[i+1];
            stmt_single.execute(params![id, val]).unwrap();
            i += 2;
        }
    }

    eprintln!("Inserting took {} seconds", start_time.elapsed().as_secs());

}

fn main() {

    let args = Args::parse();

    let stdin = io::stdin().lock();
    let mut reader = BufReader::new(stdin);

    let mut conn = Connection::open(args.db_path).unwrap();

    conn.execute_batch(
        "PRAGMA journal_mode = OFF;
            PRAGMA synchronous = 0;
            PRAGMA cache_size = 1000000;
            PRAGMA locking_mode = EXCLUSIVE;
            PRAGMA temp_store = MEMORY;",
    )
    .expect("PRAGMA");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS id_to_json (
                id BLOB PRIMARY KEY,
                json BLOB not null)",
        []
    )
    .unwrap();

    let tx = conn.transaction().unwrap();

    {
        let mut stmt_batch = tx
        .prepare_cached(("INSERT INTO id_to_json VALUES (?, ?)".to_owned()
        + &", (?, ?)".repeat(args.batch_size - 1)).as_str()).unwrap();

        let mut stmt_single = tx.prepare_cached("INSERT INTO id_to_json VALUES (?, ?)").unwrap();

        insert(&mut stmt_batch, &mut stmt_single, &mut reader, args.compression_level, args.batch_size);
    }

    let start_time2 = std::time::Instant::now();
    tx.commit().unwrap();
    eprintln!("Committing took {} seconds", start_time2.elapsed().as_secs());

}
