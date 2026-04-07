# Incident: 2026-04-07 12-18-00

## Summary

Between the hour of 11:55am and 12:00pm on April 7th, 2026, one user made two attempts to order a pizza that failed. The failure happened on the fetch call to the pizza factory, which returned a 500 error status code instead of the proper jwt pizzas. The event was detected and resolved by the incidents team within 15 minutes.

## Detection

The team began receiving alerts via Grafana's OnCall system at 11:30am for high, sustained rates of pizza creation latency. They were able to look at the metrics dashboard about 20 minutes later and found logs recording the failed requests. The response time could've been improved if the whole team had truly been "on call" instead of waiting for the devotional to end. In addition, more alerts could've been configured for tracking failed http requests or when 500 error status codes were thrown.

## Impact

There were only two active users at the time, and only one of them was affected. The one user was not able to receive their pizzas as requested and had to try again at a later time.

## Timeline

All times are UTC.

- _11:14_ - Grafana IRM sends first "Pizza creation latency" alert
- _11:24_ - Grafana IRM sends followup "Pizza creation alert"
- _11:58_ - User made the first factory service request that returned a 500 status code
- _11:59_ - User made the second factory service request that failed to make a pizza
- _12:03_ - Incidents team acknowledged the incident alerts
- _12:06_ - Logs detailing the failure were identified
- _12:07_ - Link was found to end the chaos testing
- _12:08_ - Incident was officially resolved

## Response

After receiving mobile pushes and Grafana IRM alerts, Micaela Madariaga, the on-call engineer, came online at noon. There was a slight delay in being able to access the system after having attended a campus devotional. After she reviewed the logs, she was able to copy and paste the necessary link for resolving the chaos.

## Root cause

The incident primarily occurred due to a failure interacting with the pizza factory (and an injected chaos monkey). To prevent this from happening in the future, we will be looking at adding improved handling of failed pizza requests or moving to a more reliable provider.

## Resolution

The response body of the failed requests included a new json field called "followLinkToEndChaos" with a url linked. A quick copy and paste of the link in a browser window returned a simple message saying that the issue had been resolved. A quick check on the pizza factory website confirmed that the chaos level was once again "calm". This quick turnaround for resolving the incident was enabled by a good review and understanding of the code. The engineer already had a good idea of how errors might have presented themselves.

## Prevention

Knowing the root cause, any failures communicating with the pizza factory could result in similar errors and incidents. While the main effect was seen in pizzas not being created properly, other issues could arise as well.

## Action items

Moving forward, the team will be adding more alerts linked to failed http requests. They will also look into better error handling for when the pizza factory is down so that users can be aware and other workarounds can be made.
