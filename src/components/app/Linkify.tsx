import Link from "next/link";
import { LinkItUrl, LinkIt } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";

interface linkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: linkifyProps) {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

function LinkifyUrl({ children }: linkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

function LinkifyUsername({ children }: linkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip key={key} username={match.slice(1)}>
          {match}
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: linkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => (
        <Link
          href={`/hashtag/${match.slice(1)}`}
          className="text-primary hover:underline"
          key={key}
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
