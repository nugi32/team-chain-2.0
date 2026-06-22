"use client";

import { useState } from "react";
import { useGetTaskData } from "@/utils/lib/dashboard/useGetTaskData";

export default function TaskDebugPage() {
    const [taskId, setTaskId] = useState(1);

    const {
        data: {
            getTaskData,
            getTaskStatus,
            getTaskParticipants,
            getTaskFinancials,
            getTaskMetadata,
            getTaskFlags,
            getTaskJoinRequest,
            getTaskJoinRequestsByIndex,
            getTaskJoinRequestCount,
            getTaskSubmit,
            getTaskSubmitStatus,
            getTaskSubmitContent,
            getTaskSubmitRevision,
        },
        loading,
        lastRequestedTaskId,
    } = useGetTaskData();

    // Fetch all the data for the current taskId
    const debugData = {
        task: getTaskData(taskId),
        status: getTaskStatus(taskId),
        participants: getTaskParticipants(taskId),
        financials: getTaskFinancials(taskId),
        metadata: getTaskMetadata(taskId),
        flags: getTaskFlags(taskId),

        joinRequest: getTaskJoinRequest(taskId),
        joinRequestByIndex: getTaskJoinRequestsByIndex(taskId),
        joinRequestCount: getTaskJoinRequestCount(taskId),

        submit: getTaskSubmit(taskId),
        submitStatus: getTaskSubmitStatus(taskId),
        submitContent: getTaskSubmitContent(taskId),
        submitRevision: getTaskSubmitRevision(taskId),
    };

    // Check if any data is currently loading
    const isLoading = Object.values(loading).some((status) => status === true);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Task Debug</h1>

            <div className="flex gap-2 items-center">
                <label>Task ID:</label>
                <input
                    type="number"
                    value={taskId}
                    onChange={(e) => setTaskId(Number(e.target.value))}
                    className="border rounded px-3 py-2"
                />
            </div>

            {/* Loading status */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h2 className="font-semibold text-blue-900 mb-2">Status</h2>
                <div className="space-y-1 text-sm text-blue-800">
                    <p>Requested Task ID: <span className="font-mono font-bold">{lastRequestedTaskId}</span></p>
                    <p>Currently Loading: <span className="font-bold">{isLoading ? "Yes ⏳" : "No ✓"}</span></p>
                    {isLoading && (
                        <div className="mt-2 space-y-1">
                            <p className="font-semibold">Loading Details:</p>
                            {Object.entries(loading).map(([key, value]) => 
                                value && (
                                    <p key={key} className="ml-2">
                                        • {key}: loading...
                                    </p>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Debug data output */}
            <div>
                <h2 className="font-semibold mb-2">Task Data</h2>
                <pre className="bg-black text-green-400 p-4 rounded overflow-auto text-sm max-h-96">
                    {JSON.stringify(
                        {
                            ...debugData,
                            _metadata: {
                                taskId,
                                isLoading,
                                lastRequestedTaskId,
                            },
                        },
                        (_, value) =>
                            typeof value === "bigint"
                                ? value.toString()
                                : value === undefined
                                ? "undefined (still loading?)"
                                : value,
                        2
                    )}
                </pre>
            </div>

            {/* Help text */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded text-sm text-amber-900">
                <p className="font-semibold mb-2">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Data may be <code className="bg-amber-100 px-1 rounded">undefined</code> while loading from contract</li>
                    <li>Wait for "Currently Loading: No ✓" before relying on data</li>
                    <li>Check the "Loading Details" to see which fields are still loading</li>
                </ul>
            </div>
        </div>
    );
}