import Link from "next/link";
import type { ReactNode } from "react";

interface ActionLinkProps {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  external?: boolean;
  className?: string;
}

const variantClass = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost: "btn",
  danger: "btn btn-danger",
};

export function ActionLink({
  children,
  href,
  variant = "ghost",
  disabled = false,
  external = false,
  className,
}: ActionLinkProps) {
  const classes = [variantClass[variant], disabled ? "is-disabled" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  if (disabled) {
    return (
      <span aria-disabled="true" className={classes}>
        {children}
      </span>
    );
  }

  if (external) {
    return (
      <a className={classes} href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}
