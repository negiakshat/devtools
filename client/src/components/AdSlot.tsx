/** Precision Console design reminder: any optional sponsor reserve remains visually quiet and never interrupts an execution path. */
export default function AdSlot({ label = "Reserved ad slot" }: { label?: string }) {
  return <aside className="ad-slot" aria-label={label}><span>OPTIONAL SPONSOR RESERVE</span><p>{label}</p></aside>;
}
