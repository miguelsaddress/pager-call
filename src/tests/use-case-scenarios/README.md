This tests test the use case scenarios given in the Provided Readme file

## Use Case Scenario 1:

```
Given a Monitored Service in a Healthy State,
when the Pager receives an Alert related to this Monitored Service,
then the Monitored Service becomes Unhealthy,
the Pager notifies all targets of the first level of the escalation policy,
and sets a 15-minutes acknowledgement delay
```

## Use Case Scenario 2:

```
Given a Monitored Service in an Unhealthy State,
the corresponding Alert is not Acknowledged
and the last level has not been notified,
when the Pager receives the Acknowledgement Timeout,
then the Pager notifies all targets of the next level of the escalation policy
and sets a 15-minutes acknowledgement delay.
```

## Use Case Scenario 3:

```
Given a Monitored Service in an Unhealthy State
when the Pager receives the Acknowledgement
and later receives the Acknowledgement Timeout,
then the Pager doesn't notify any Target
and doesn't set an acknowledgement delay.
```

## Use Case Scenario 4:
```
Given a Monitored Service in an Unhealthy State,
when the Pager receives an Alert related to this Monitored Service,
then the Pager doesn’t notify any Target
and doesn’t set an acknowledgement delay
```

**NOTE**:

> I have problems understanding this scenario in case there is no error in it's definition. If the service is unhealthy
 My understanding would be that the pager should notify and set timeouts when an alert is sent to it.
>
> If it means that once a service was marked as unhealthy a new alert is sent, it is discarded, this would require changes
in the code, since the adapter calls the "Pager.receive(alert)" function. One possible change would be to have a flag or 
different function to send alerts from the adapter, but it's hacky, since anybody else could invoke that function outside
the handler.
>
> Given that I don't understand this and I do not have a product owner to ask, or colleagues to ask for their opinions or
ideas, I discard testing this scenario. Please let me know if it's important for you and we can clarify what the request is


## Use Case Scenario 5:

```
Given a Monitored Service in an Unhealthy State,
when the Pager receives a Healthy event related to this Monitored Service
and later receives the Acknowledgement Timeout,
then the Monitored Service becomes Healthy,
the Pager doesn’t notify any Target
and doesn’t set an acknowledgement delay
```