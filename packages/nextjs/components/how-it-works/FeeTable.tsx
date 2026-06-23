import { Info } from "lucide-react";

interface FeeRow {
  action: string;
  fee: string;
  paidBy: string;
  note: string;
}

export default function FeeTable({ fees }: { fees: FeeRow[] }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2 bg-gray-800/30">
        <Info className="w-3.5 h-3.5 text-indigo-400" />
        <p className="text-xs text-gray-400">
          Gas fees vary by network congestion. Estimates are based on Ethereum mainnet at 20 Gwei.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Action</th>
              <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Fee</th>
              <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Paid By</th>
              <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((row, idx) => (
              <tr
                key={row.action}
                className={`border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-800/10"}`}
              >
                <td className="px-5 py-3.5 text-gray-200 font-medium">{row.action}</td>
                <td className="px-3 py-3.5">
                  <span className="font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1">
                    {row.fee}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-gray-400">{row.paidBy}</td>
                <td className="px-5 py-3.5 text-gray-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
