import { ActivityLogType } from '@/types/apps/activityLogsType';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import React from 'react';

type EditUserInfoProps = {
    open: boolean
    setOpen: (open: boolean) => void
    data: ActivityLogType,
}

const ViewLogInfo = ({ open, setOpen, data }: EditUserInfoProps) => {

    const [copyTooltip, setCopyTooltip] = React.useState({ parameters: "Copy JSON", response: "Copy JSON" });


    const handleClose = () => {
        setOpen(false)
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopyTooltip((prev) => ({ ...prev, [field]: "Copied!" }));

        // Reset tooltip text after 2 seconds
        setTimeout(() => {
            setCopyTooltip((prev) => ({ ...prev, [field]: "Copy JSON" }));
        }, 2000);
    };

    return (
        <>
            <Dialog fullWidth open={open} onClose={handleClose} maxWidth="sm" scroll="body" closeAfterTransition={false}>
                <div className="p-5 bg-white rounded-lg shadow-lg relative">

                    {/* Title */}
                    <div className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex justify-between items-center">
                        <span>Log Details</span>
                        <IconButton onClick={handleClose} className="text-gray-600">
                            <i className="ri-close-line text-xl" />
                        </IconButton>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-500">
                                {data?.createdOn ? new Date(data.createdOn).toLocaleString() : ""}
                            </p>
                            <h2 className="text-lg font-semibold">{data?.description}</h2>
                            <p className="text-sm text-gray-600">{data?.route}</p>
                        </div>
                        {
                            data?.createdByName && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Created By</p>
                                    <p className="font-semibold">{data?.createdByName}</p>
                                </div>
                            )
                        }
                    </div>

                    <DialogContent className="space-y-4 p-0">
                        {/* Parameters Section */}
                        <div className="border rounded-lg p-3 bg-gray-50 relative">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">Parameters</p>
                                <Tooltip title={copyTooltip.parameters} arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => copyToClipboard(JSON.stringify(data?.parameters, null, 2), "parameters")}
                                    >
                                        <i className="ri-file-copy-line text-gray-600" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded-lg overflow-auto max-h-40">
                                {JSON.stringify(data?.parameters, null, 2) || "No parameters"}
                            </pre>
                        </div>

                        {/* Response Section */}
                        <div className="border rounded-lg p-3 bg-gray-50 relative">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">Response</p>
                                <Tooltip title={copyTooltip.response} arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => copyToClipboard(JSON.stringify(data?.response, null, 2), "response")}
                                    >
                                        <i className="ri-file-copy-line text-gray-600" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded-lg overflow-auto max-h-40">
                                {JSON.stringify(data?.response, null, 2) || "No response"}
                            </pre>
                        </div>
                    </DialogContent>
                </div>
            </Dialog>
        </>
    );

}

export default ViewLogInfo;
