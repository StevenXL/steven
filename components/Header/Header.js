import Link from "next/link";
import className from "classnames";
import { useRouter } from "next/router";

export default function Header() {
  const { pathname } = useRouter();

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link href="/">
          <a className="navbar-brand">Steven</a>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className={className("nav-item", { active: pathname === "/" })}>
              <Link href="/">
                <a className={`nav-link ${pathname === "/" ? "active" : null}`}>
                  Home
                </a>
              </Link>
            </li>

            <li
              className={className("nav-item", {
                active: pathname === "/about",
              })}
            >
              <Link href="/about">
                <a className="nav-link">About</a>
              </Link>
            </li>

            <li
              className={className("nav-item", {
                active: pathname === "/tags",
              })}
            >
              <Link href="/tags">
                <a className="nav-link">All Topics</a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
