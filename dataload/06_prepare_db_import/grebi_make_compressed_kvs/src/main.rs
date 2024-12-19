
use flate2::write::ZlibEncoder;
use flate2::Compression;
use grebi_shared::get_id;
use rusqlite::Statement;
use rusqlite::ToSql;
use core::slice;
use std::io::BufReader;
use std::io::BufRead;
use std::io::BufWriter;
use std::io::StdinLock;
use std::io;
use std::io::Write;
use clap::Parser;

use rusqlite::{params, Connection, Transaction};

#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

fn insert(
    stmt_batch:&mut Statement,
    stmt_single:&mut Statement,
    reader:&mut BufReader<StdinLock<>>,
    compression_level:u32,
    batch_size:usize) {
}

fn main() {

    let stdin = io::stdin().lock();
    let mut reader = BufReader::new(stdin);

    let stdout = io::stdout().lock();
    let mut writer = BufWriter::new(stdout);

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

        let id = get_id(&line);

        writer.write_all(id).unwrap();
        writer.write_all(b"\0").unwrap();

        let mut enc = ZlibEncoder::new(Vec::new(), Compression::new(9));
        enc.write_all(&line).unwrap();
        let compressed = enc.finish().unwrap();

        writer.write_all(&compressed).unwrap();
        writer.write_all(b"\0").unwrap();
    }

}
