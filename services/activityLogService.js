const ActivityLog = require('../models/activityLog');

module.exports = class ActivityLogService{
    static async LogActivity(action, performedByType, performedBy, targetModel, target, details){
        await ActivityLog.create({
            action,
            performedByType,
            performedBy,
            targetModel,
            target,
            details,
        })
    }
}