import moment from "moment";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import React, { Fragment } from "react";
import SearchBox from "../../components/SearchBox";
import { get } from "../../app/api";
import Stats from "../../model/Stats";

export default function Home() {

  document.title = "EMBL-EBI Knowledge Graph";

  let [stats, setStats] = useState<Stats|null>(null);
  
  useEffect(() => {
    get<Stats>("api/v1/stats").then(r => setStats(r));
  }, []);

  return (
    <div>
      <Header section="home" />
      <main className="container mx-auto px-4 h-fit">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-r from-neutral-light to-white rounded-lg my-8 p-8">
              <div className="text-3xl mb-4 text-neutral-black font-bold">
                Welcome to the EMBL-EBI Knowledge Graph
              </div>
              <div className="flex flex-nowrap gap-4 mb-4">
                <SearchBox />
              </div>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                <div className="text-neutral-black">
                  <span>
                    Examples:&nbsp;
                    <Link to={"/search?q=diabetes"} className="link-default">
                      diabetes
                    </Link>
                    &#44;&nbsp;
                    <Link to={"/search?q=BRCA1"} className="link-default">
                      BRCA1
                    </Link>
                  </span>
                </div>
                {/* <div className="md:text-right">
                  <Link to={"/ontologies"} className="link-default">
                    Looking for a particular collection?
                  </Link>
                </div> */}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 lg:order-none order-first">
            <div className="shadow-card border-b-8 border-link-default rounded-md mt-8 p-4">
              <div className="text-2xl text-neutral-black font-bold mb-3">
                <i className="icon icon-common icon-analyse-graph icon-spacer" />
                <span>Data Content</span>
              </div>
              {stats ? (
                <div className="text-neutral-black">
                  {/* <div className="mb-2 text-sm italic">
                    Updated&nbsp;
                    {moment(stats.lastModified).format(
                      "D MMM YYYY ddd HH:mm(Z)"
                    )}
                  </div> */}
                  <ul className="list-disc list-inside pl-2">
                    <li>
                      {stats.num_nodes.toLocaleString()} nodes
                    </li>
                    <li>
                      {stats.num_edges.toLocaleString()} edges
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="text-center">
                  <div className="spinner-default w-7 h-7" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
