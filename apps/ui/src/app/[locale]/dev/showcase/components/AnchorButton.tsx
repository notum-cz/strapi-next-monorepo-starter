export function AnchorButton({ id, label }: { id: string; label: string }) {
  return (
    <a
      key={id}
      href={`#${id}`}
      className="rounded-md bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200"
    >
      {label}
    </a>
  )
}
