
use grebi_shared::get_id;
use grebi_shared::json_lexer::JsonToken;
use std::collections::HashMap;
use std::collections::HashSet;
use std::fs::File;
use std::io::BufReader;
use std::io::BufRead;
use std::io::BufWriter;
use std::io::Write;
use std::io;
use std::iter::Map;
use grebi_shared::get_subjects;
use clap::Parser;

use grebi_shared::slice_merged_entity::SlicedEntity;
use grebi_shared::slice_merged_entity::SlicedReified;
use grebi_shared::slice_merged_entity::SlicedProperty;
use grebi_shared::json_lexer::{JsonTokenType};
use serde_json::json;


#[derive(clap::Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {

    #[arg(long)]
    out_summary_json_path: String,

    #[arg(long)]
    out_metadata_jsonl_path: String,

    #[arg(long)]
    name_fields: String
}

fn main() {

    let args = Args::parse();

    let start_time = std::time::Instant::now();

    let stdin = io::stdin().lock();
    let mut reader = BufReader::new(stdin);

    let mut entity_props_to_count:HashMap<Vec<u8>,i64> = HashMap::new();
    let mut edge_props_to_count:HashMap<Vec<u8>,i64> = HashMap::new();


    let mut name_fields:Vec<Vec<u8>> = Vec::new();
    for prop in args.name_fields.split(",") {
        name_fields.push(prop.as_bytes().to_vec());
    }

    let mut summary_writer = BufWriter::new(File::create(&args.out_summary_json_path).unwrap());
    let mut metadata_writer = BufWriter::new(File::create(&args.out_metadata_jsonl_path).unwrap());

    let mut line:Vec<u8> = Vec::new();
    let mut n:i64 = 0;

    loop {

        line.clear();
        reader.read_until(b'\n', &mut line).unwrap();

        if line.len() == 0 {
            eprintln!("saw {} subjects", n);
            break;
        }

        let id = get_id(&line);

        metadata_writer.write_all(r#"{"grebi:nodeId":""#.as_bytes()).unwrap();
        metadata_writer.write_all(id).unwrap();
        metadata_writer.write_all(r#"""#.as_bytes()).unwrap();

        let sliced = SlicedEntity::from_json(&line);

        let mut names:Vec<Option<&[u8]>> = Vec::with_capacity(name_fields.len());
        for _ in 0..name_fields.len() {
            names.push(None);
        }

        sliced.props.iter().for_each(|prop| {

            let prop_key = prop.key.to_vec();

            if prop_key.eq(b"grebi:type") || prop_key.eq(b"grebi:datasources") || prop_key.eq(b"id") {
                metadata_writer.write_all(r#",""#.as_bytes()).unwrap();
                metadata_writer.write_all(&prop_key).unwrap();
                metadata_writer.write_all(r#"":"#.as_bytes()).unwrap();
                metadata_writer.write_all(prop.value).unwrap();
            }

            let mut n_name_field:Option<usize> = None;
            for i in 0..name_fields.len() {
                if name_fields[i] == prop_key {
                    n_name_field = Some(i);
                    break;
                }
            }
            
            let count = entity_props_to_count.entry(prop_key).or_insert(0);
            *count += 1;

            if prop.kind == JsonTokenType::StartObject {

                let reified = SlicedReified::from_json(&prop.value);

                if reified.is_some() {
                    let reified_u = reified.unwrap();
                    reified_u.props.iter().for_each(|prop| {
                        let prop_key = prop.key.to_vec();

                        let count2 = edge_props_to_count.entry(prop_key).or_insert(0);
                        *count2 += 1;
                    });

                    if n_name_field.is_some() {
                        if reified_u.value_kind == JsonTokenType::StartString {
                            names[n_name_field.unwrap()] = Some(&reified_u.value[1..reified_u.value.len()-1]);
                        }
                    }
                }
            } else if prop.kind == JsonTokenType::StartString {
                if n_name_field.is_some() {
                    names[n_name_field.unwrap()] = Some(&prop.value[1..prop.value.len()-1]);
                }
            }
        });

        for name in names {
            if name.is_some() {
                metadata_writer.write_all(r#","_name":""#.as_bytes()).unwrap();
                metadata_writer.write_all(&name.unwrap()).unwrap();
                metadata_writer.write_all(r#"""#.as_bytes()).unwrap();
            }
        }
        metadata_writer.write_all("}\n".as_bytes()).unwrap();

        n = n + 1;

        if n % 1000000 == 0 {
            eprintln!("{}", n);
        }
    }
    eprintln!("Extracting IDs took {} seconds", start_time.elapsed().as_secs());




    let start_time3 = std::time::Instant::now();

    summary_writer.write_all(
    serde_json::to_string_pretty(&json!({
        "entity_props": entity_props_to_count.iter().map(|(k,v)| {
                return (String::from_utf8(k.to_vec()).unwrap(), json!({
                    "count": v
                }))
        }).collect::<HashMap<String,serde_json::Value>>(),
        "edge_props": edge_props_to_count.iter().map(|(k,v)| {
                return (String::from_utf8(k.to_vec()).unwrap(), json!({
                    "count": v
                }))
        }).collect::<HashMap<String,serde_json::Value>>()
    })).unwrap().as_bytes()).unwrap();
    
    eprintln!("Building metadata took {} seconds", start_time3.elapsed().as_secs());

}
