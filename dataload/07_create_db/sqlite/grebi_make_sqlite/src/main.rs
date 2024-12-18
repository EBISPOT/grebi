
use grebi_shared::get_id;
use rusqlite::Statement;
use std::io::BufReader;
use std::io::BufRead;
use std::io::StdinLock;
use std::io;
use std::io::Write;
use clap::Parser;

use rusqlite::{params, Connection, Transaction};

use grebi_shared::json_lexer::{JsonTokenType};
use lz4::{EncoderBuilder};


#[derive(clap::Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {

    #[arg(long)]
    db_path: String
}

fn insert(stmt:&mut Statement, reader:&mut BufReader<StdinLock<>>) {

    let start_time = std::time::Instant::now();


    let mut line:Vec<u8> = Vec::new();
    let mut n:i64 = 0;

    loop {

        line.clear();
        reader.read_until(b'\n', &mut line).unwrap();

        if line.len() == 0 {
            eprintln!("saw {} subjects", n);
            break;
        }

        let compressed =  {
            let mut enc = lz4::EncoderBuilder::new().build(Vec::new()).unwrap();
            enc.write(&line).unwrap();
            let (v, r) = enc.finish();
            r.unwrap();
            v
        };

        let id = get_id(&line);

        stmt.execute(params![id, compressed]).unwrap();

        n = n + 1;

        if n % 1000000 == 0 {
            eprintln!("{}", n);
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
        let mut stmt = tx
        .prepare_cached("INSERT INTO id_to_json VALUES (?, ?)")
        .unwrap();

        insert(&mut stmt, &mut reader);
    }

    let start_time2 = std::time::Instant::now();
    tx.commit().unwrap();
    eprintln!("Committing took {} seconds", start_time2.elapsed().as_secs());

}
