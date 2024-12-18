
use grebi_shared::get_id;
use rusqlite::Statement;
use rusqlite::ToSql;
use std::io::BufReader;
use std::io::BufRead;
use std::io::BufWriter;
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
    batch_size: usize,

    #[arg(long)]
    page_size: usize,

    #[arg(long)]
    cache_size: usize
}

fn insert(
    stmt_batch:&mut Statement,
    stmt_single:&mut Statement,
    reader:&mut BufReader<StdinLock<>>,
    compression_level:u32,
    batch_size:usize) {

    let start_time = std::time::Instant::now();


    let mut n:i64 = 0;


    let mut start_time3 = std::time::Instant::now();

    let mut buf:Vec<u8> = Vec::new();
    let mut param_locs: Vec<(usize, usize)> = Vec::new();
    let mut line:Vec<u8> = Vec::new();

    loop {

        line.clear();
        reader.read_until(b'\n', &mut line).unwrap();

        if line.len() == 0 {
            eprintln!("saw {} lines", n);
            break;
        }

        let id_start = buf.len();
        let id = get_id(&line);
        buf.extend(id.iter());
        let id_end = buf.len();

        let data_start = buf.len();
        {
            let mut enc = lz4::EncoderBuilder::new().level(compression_level).build(BufWriter::new(&mut buf)).unwrap();
            enc.write(&line).unwrap();
            enc.finish().1.unwrap();
        }
        let data_end = buf.len();

        param_locs.push((id_start, id_end));
        param_locs.push((data_start, data_end));

        if param_locs.len() == 2*batch_size {
            stmt_batch.execute(
                rusqlite::params_from_iter(
                    param_locs.iter().map(|(start, end)| &buf[*start..*end])
                )
            ).unwrap();
            param_locs.clear();
            buf.clear();
        }

        n = n + 1;

        if n % 1000000 == 0 {
            eprintln!("inserted {}                  [last 1m took {} seconds]", n, start_time3.elapsed().as_secs());
            start_time3 = std::time::Instant::now();
        }
    }

    // insert the last ones if we didn't reach batch size
    if param_locs.len() > 0 {
        let mut i = 0;
        while i < param_locs.len() {
            let id_loc = param_locs[i];
            let val_loc = param_locs[i+1];
            let id = &buf[id_loc.0..id_loc.1];
            let val = &buf[val_loc.0..val_loc.1];
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

    let cache_size = args.cache_size;
    let page_size = args.page_size;

    conn.execute_batch(
        format!("PRAGMA journal_mode = OFF;
            PRAGMA synchronous = 0;
            PRAGMA cache_size = {cache_size};
            PRAGMA page_size = {page_size};
            PRAGMA locking_mode = EXCLUSIVE;
            PRAGMA temp_store = MEMORY;").as_str()
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
