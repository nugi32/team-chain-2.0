"use client";

import { useGetCompleteTasks } from "@/utils/lib/tasksHelper/useGetCompleteTasks";
import { useAccount } from "wagmi";

export default function CompleteTasksPage() {
const { address, isConnected } = useAccount();

const {
taskCounter,
tasks,

    creatorTasks,
    latestCreatorTask,

    createdTasks,
    activeTasks,
    openRegistrationTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,

    loading,

} = useGetCompleteTasks(address);

if (!isConnected) {
return (
<div className="p-6">
<h1 className="text-3xl font-bold mb-4">Complete Tasks Dashboard</h1>

        <div className="border rounded-lg p-4">Please connect your wallet.</div>
      </div>
    );

}

if (loading.isLoading) {
return (
<div className="p-6">
<h1 className="text-3xl font-bold mb-4">Complete Tasks Dashboard</h1>

        <div className="border rounded-lg p-4">Loading tasks...</div>
      </div>
    );

}

return (
<div className="p-6 space-y-8">
{/_ Header _/}
<div>
<h1 className="text-3xl font-bold">Complete Tasks Dashboard</h1>

        <p className="text-sm text-gray-500 mt-2">Connected Wallet: {address}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <SummaryCard title="Task Counter" value={taskCounter?.toString() ?? "0"} />

        <SummaryCard title="All Tasks" value={tasks.length} />

        <SummaryCard title="Created" value={createdTasks.length} />

        <SummaryCard title="Active" value={activeTasks.length} />

        <SummaryCard title="Open Registration" value={openRegistrationTasks.length} />

        <SummaryCard title="In Progress" value={inProgressTasks.length} />

        <SummaryCard title="Completed" value={completedTasks.length} />

        <SummaryCard title="Cancelled" value={cancelledTasks.length} />
      </div>

      {/* Creator Summary */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Creator Information</h2>

        <div className="space-y-2">
          <p>
            <strong>Creator Tasks:</strong> {creatorTasks.length}
          </p>

          {latestCreatorTask && (
            <>
              <p>
                <strong>Latest Task:</strong> {latestCreatorTask.title}
              </p>

              <p>
                <strong>Latest Task ID:</strong> {latestCreatorTask.smartContractId}
              </p>
            </>
          )}
        </div>

        {latestCreatorTask && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Latest Creator Task JSON</summary>

            <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(latestCreatorTask, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* All Tasks */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <div className="border rounded-lg p-6">No tasks found.</div>
        ) : (
          <div className="space-y-6">
            {tasks.map(task => (
              <TaskCard key={task.smartContractId} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Raw Debug Data */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Debug Data</h2>

        <details>
          <summary className="cursor-pointer font-medium">View Full Hook Response</summary>

          <pre className="mt-4 bg-black text-green-400 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(
              {
                taskCounter,
                tasks,
                creatorTasks,
                latestCreatorTask,
                createdTasks,
                activeTasks,
                openRegistrationTasks,
                inProgressTasks,
                completedTasks,
                cancelledTasks,
              },
              (_, value) => (typeof value === "bigint" ? value.toString() : value),
              2,
            )}
          </pre>
        </details>
      </div>
    </div>

);
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
return (
<div className="border rounded-lg p-4">
<p className="text-sm text-gray-500">{title}</p>

      <p className="text-2xl font-bold">{value}</p>
    </div>

);
}

function TaskCard({ task }: { task: any }) {
return (
<div className="border rounded-lg p-6">
<div className="flex flex-col md:flex-row md:justify-between gap-4">
<div>
<h3 className="text-xl font-bold">{task.title}</h3>

          <p className="text-sm text-gray-500">Smart Contract ID: {task.smartContractId}</p>

          <p className="text-sm text-gray-500">Status: {task.status}</p>
        </div>

        {task.picture && <img src={task.picture} alt={task.title} className="w-40 h-40 rounded object-cover" />}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        {/* Smart Contract */}
        <div>
          <h4 className="font-bold mb-3">Smart Contract Data</h4>

          <ul className="space-y-1 text-sm">
            <li>
              <strong>ID:</strong> {task.smartContractId}
            </li>

            <li>
              <strong>Value:</strong> {task.value}
            </li>

            <li>
              <strong>Reward:</strong> {task.reward}
            </li>

            <li>
              <strong>Deadline At:</strong> {task.deadlineAt}
            </li>

            <li>
              <strong>Created At:</strong> {task.createdAt}
            </li>

            <li>
              <strong>Creator Stake:</strong> {task.creatorStake}
            </li>

            <li>
              <strong>Member Stake:</strong> {task.memberStake}
            </li>

            <li>
              <strong>Max Revision:</strong> {task.maxRevision}
            </li>

            <li>
              <strong>Deadline Hours:</strong> {task.deadlineHours}
            </li>

            <li>
              <strong>Creator:</strong> {task.creator}
            </li>

            <li>
              <strong>Member:</strong> {task.member}
            </li>

            <li>
              <strong>Github URL:</strong> {task.githubURL}
            </li>

            <li>
              <strong>Member Stake Locked:</strong> {String(task.isMemberStakeLocked)}
            </li>

            <li>
              <strong>Creator Stake Locked:</strong> {String(task.isCreatorStakeLocked)}
            </li>

            <li>
              <strong>Reward Claimed:</strong> {String(task.isRewardClaimed)}
            </li>

            <li>
              <strong>Exists:</strong> {String(task.exists)}
            </li>
          </ul>
        </div>

        {/* Express */}
        <div>
          <h4 className="font-bold mb-3">Express Data</h4>

          <ul className="space-y-1 text-sm">
            <li>
              <strong>Express ID:</strong> {task.expressId}
            </li>

            <li>
              <strong>Owner:</strong> {task.owner}
            </li>
          </ul>

          <div className="mt-4">
            <h5 className="font-semibold mb-2">Description</h5>
            <p className="text-sm">{task.description}</p>
          </div>
        </div>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer font-medium">Raw JSON</summary>

        <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs">{JSON.stringify(task, null, 2)}</pre>
      </details>
    </div>

);
}
