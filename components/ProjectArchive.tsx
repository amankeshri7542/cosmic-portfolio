"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { archive } from "@/lib/portfolio";
export default function ProjectArchive() {
  const [query, setQuery] = useState("");
  const filtered = archive.filter((project) =>
    `${project.title} ${project.kind} ${project.tech}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    const reveal = () => {
      const record = document.getElementById(window.location.hash.slice(1));
      if (record instanceof HTMLDetailsElement) record.open = true;
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  return (
    <div className="archive-collection">
      <div className="archive-tools">
        <label className="archive-search">
          <span className="sr-only">Find a project</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="6" stroke="currentColor" />
            <path d="m15 15 5 5" stroke="currentColor" />
          </svg>
          <input
            type="search"
            placeholder="Find a project or technology"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="micro" role="status">
          {filtered.length} / {archive.length} projects
        </span>
      </div>
      <div className="archive-records">
        {filtered.map((project) => (
          <details className="archive-record" id={project.id} key={project.id}>
            <summary>
              <span className="archive-kind">{project.kind}</span>
              <h3>{project.title}</h3>
              <span className="archive-date">{project.date}</span>
              <span className="disclosure-mark" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="archive-expanded">
              <div className="archive-image">
                <Image
                  src={project.image}
                  alt={`${project.title} project screenshot`}
                  width={900}
                  height={600}
                  sizes="(max-width: 700px) 90vw, 360px"
                />
              </div>
              <div>
                <p>{project.description}</p>
                <p className="muted">{project.detail}</p>
                <p className="stack">{project.tech}</p>
                <div className="text-links">
                  {project.href && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit project ↗
                    </a>
                  )}
                  {project.diagram && (
                    <a
                      href={project.diagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View architecture ↗
                    </a>
                  )}
                  <a
                    href={`#${project.id}`}
                    aria-label={`Link to ${project.title}`}
                  >
                    Permalink
                  </a>
                </div>
              </div>
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <div className="archive-empty">
            <p>No projects match “{query}”.</p>
            <button className="text-link" onClick={() => setQuery("")}>
              Show every project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
