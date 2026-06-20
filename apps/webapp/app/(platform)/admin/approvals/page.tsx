export default function ApprovalsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
                    <p className="text-sm text-gray-500 mt-1">Review pending requests</p>
                </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
        </div>
    );
}
