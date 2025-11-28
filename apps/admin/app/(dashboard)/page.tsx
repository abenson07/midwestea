// Force dynamic rendering to ensure OpenNext generates required files
export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { Logo } from "@midwestea/ui";

export default async function DashboardPage() {
    // Force dynamic rendering by accessing cookies
    await cookies();
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Logo />
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder cards */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                {/* Icon placeholder */}
                                <div className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                                    <dd className="text-lg font-medium text-gray-900">12</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                {/* Icon placeholder */}
                                <div className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Classes</dt>
                                    <dd className="text-lg font-medium text-gray-900">4</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                {/* Icon placeholder */}
                                <div className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                                    <dd className="text-lg font-medium text-gray-900">2</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
