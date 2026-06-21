"use client";

import React, { useState, useEffect } from "react";
import { getTaskBySmartContractId, getAllTasks} from "@/utils/lib/express/queries/tasks";

export default function TestPage() {
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const task = await getTaskBySmartContractId("11");
                const allTasks = await getAllTasks();
                console.log("Fetched all tasks:", allTasks);
                console.log("Fetched task:", task);
            } catch (error) {
                console.error("Error fetching task:", error);
            }
        };

        fetchTask();
    }, []);
}