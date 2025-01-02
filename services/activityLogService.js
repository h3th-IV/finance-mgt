const ActivityLog = require('../models/activityLog');

module.exports = class ActivityLogService{
    static async LogActivity(action, performedByType, performedBy, targetModel, target, details = {}){
        try{
            await ActivityLog.create({
                action,
                performedByType,
                performedBy,
                targetModel,
                target,
                details,
            })
        }catch(error){
            console.error('Failed to log to activity: ', error);
            throw new Error('Activity logging failed');
        }
    }

    static async getActivityLogs(targetModel, targetId) {
        try {
            const logs = await ActivityLog.find({ targetModel, target: targetId })
                .populate("performedBy")
                .sort({ createdAt: -1 });

            if (!logs.length) {
                return {
                    success: false,
                    message: `No activity logs found for ${targetModel} with ID ${targetId}`,
                };
            }

            return {
                success: true,
                message: "Activity logs retrieved successfully",
                data: logs,
            };
        } catch (error) {
            console.error("Error fetching activity logs:", error);
            return { success: false, message: "Error fetching activity logs" };
        }
    }
}