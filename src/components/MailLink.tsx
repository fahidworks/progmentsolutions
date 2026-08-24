import { type ReactNode, useCallback } from "react";
import { site } from "@/lib/site";

type Props = {
  className?: string;
  children?: ReactNode;
  subject?: string;
};

/**
 * Email link that opens the default mail client. If no mail handler is
 * registered (common inside preview iframes / Chromebooks), it falls back to
 * Gmail's web compose window so the click always does something.
 */
export function MailLink({ className, children, subject }: Props) {
  const mailto = `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(site.email)}${
        subject ? `&su=${encodeURIComponent(subject)}` : ""
      }`;
      const start = Date.now();
      let handled = false;
      const onBlur = () => {
        handled = true;
      };
      window.addEventListener("blur", onBlur, { once: true });
      try {
        window.location.href = mailto;
      } catch {
        /* ignore */
      }
      window.setTimeout(() => {
        window.removeEventListener("blur", onBlur);
        if (!handled && Date.now() - start < 2000) {
          window.open(gmail, "_blank", "noopener,noreferrer");
        }
      }, 600);
    },
    [mailto, subject],
  );

  return (
    <a href={mailto} onClick={onClick} className={className}>
      {children ?? site.email}
    </a>
  );
}
