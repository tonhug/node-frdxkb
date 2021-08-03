'use strict';

const functions = require('firebase-functions');
const request = require('request-promise');

const notifyLine = (lineMessage, stkPkgId, stkId) => {
    return request({
      method: `POST`,
      uri: `https://notify-api.line.me/api/notify`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer O6mcVmJLzHE2gziUpmX9jV6WpfMsk2zIFvMcYEyNS6h`
      },
      form: {
        message: lineMessage,
        stickerPackageId: stkPkgId,
        stickerId: stkId
      }
    });
  };
  
  exports.postOnNewIssue = functions.crashlytics.issue().onNew((issue) => {
    console.info('postOnNewIssue', issue.issueTitle);
    const issueId = issue.issueId;
    const issueTitle = issue.issueTitle;
    const appName = issue.appInfo.appName;
    const appPlatform = issue.appInfo.appPlatform;
    const latestAppVersion = issue.appInfo.latestAppVersion;
  
    const lineMessage = `There is a new issue - ${issueTitle} ${functions.config().crashlytics.url}${issueId} ` + `in ${appName}, version ${latestAppVersion} on ${appPlatform}`;
  
    return notifyLine(lineMessage, 2, 34).then(() => {
      console.log(`Posted new issue ${issueId} successfully to Slack`);
      return issueId;
    });
  });
  
  exports.postOnRegressedIssue = functions.crashlytics.issue().onRegressed((issue) => {
    console.info('postOnRegressedIssue', issue.issueTitle);
    const issueId = issue.issueId;
    const issueTitle = issue.issueTitle;
    const appName = issue.appInfo.appName;
    const appPlatform = issue.appInfo.appPlatform;
    const latestAppVersion = issue.appInfo.latestAppVersion;
    const resolvedTime = issue.resolvedTime;
  
    const lineMessage = `There is a regressed issue ${issueTitle} ${functions.config().crashlytics.url}${issueId} ` + `in ${appName}, version ${latestAppVersion} on ${appPlatform}. This issue was previously ` + `resolved at ${new Date(resolvedTime).toString()}`;
  
    return notifyLine(lineMessage, 1, 15).then(() => {
      console.log(`Posted regressed issue ${issueId} successfully to Slack`);
      return issueId;
    });
  });
  
  exports.postOnVelocityAlertIssue = functions.crashlytics.issue().onVelocityAlert((issue) => {
    console.info('postOnVelocityAlertIssue', issue.issueTitle);
    const issueId = issue.issueId;
    const issueTitle = issue.issueTitle;
    const appName = issue.appInfo.appName;
    const appPlatform = issue.appInfo.appPlatform;
    const latestAppVersion = issue.appInfo.latestAppVersion;
    const crashPercentage = issue.velocityAlert.crashPercentage;
  
    const lineMessage = `There is an issue ${issueTitle} ${functions.config().crashlytics.url}${issueId} ` + `in ${appName}, version ${latestAppVersion} on ${appPlatform} that is causing ` + `${parseFloat(crashPercentage).toFixed(2)}% of all sessions to crash.`;
        
    return notifyLine(lineMessage, 2, 24).then(() => {
      console.log(`Posted velocity alert ${issueId} successfully to Slack`);
      return issueId;
    });
  });