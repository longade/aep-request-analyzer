const getEventType = (eventType) => {

    const type = {
        pageView: 'web.webpagedetails.pageViews',
        customLink: 'web.webinteraction.linkClicks'
    }

    let callType;
    if (eventType === type.pageView) {
        callType = 'Page View';
    }
    else if (eventType === type.customLink) {
        callType = 'Custom Link';
    }
    return callType || 'Unknown';
}

const getEVars = (analytics) => {
    return Object.fromEntries(Object.entries(analytics.customDimensions.eVars).filter(([key, value]) => value));
}

const getHierarchies = (analytics) => {
    return { ...analytics.customDimensions.hierarchies.hier1, values: [...analytics.customDimensions.hierarchies.hier1.values].join(';') };
}

const getLists = (analytics) => {
    return Object.entries(analytics.customDimensions.lists)
        .map(([key, value]) => value.list)
        .filter(list => list.length > 0)
        .map(list => list.map(el => el.value));
}

const getProps = (analytics) => {
    return Object.fromEntries(Object.entries(analytics.customDimensions.props).filter(([key, value]) => value));
}

const printDimensions = (dimensions) => {
    // console.log('Dimensions: ', dimensions);

    console.groupCollapsed('props');
    console.table(dimensions.props);
    console.groupEnd();

    console.groupCollapsed('eVars');
    console.table(dimensions.eVars);
    console.groupEnd();

    console.groupCollapsed('Hierarchies');
    console.table(dimensions.hierarchies);
    console.groupEnd();

    dimensions.lists.forEach((list, index) => {
        console.groupCollapsed('List ' + index);
        console.table(list);
        console.groupEnd();
    });
}

const getEvents = (analytics) => {
    const events = {...analytics.event1to100, ...analytics.event101to200};
    return Object.fromEntries(Object.entries(events).filter(([key, value]) => value.value === 1));
}

const printEvents = (events) => {
    console.groupCollapsed('Events');
    console.table(events);
    console.groupEnd();
}

const printAll = (callType, dimensions, events) => {
    const color = callType === 'Page View' ? 'color: lightgreen; background: black' : 'color: yellow; background: black;'
    console.group('[AEP] Adobe Analytics call: %c' + callType, color);
    printDimensions(dimensions)
    printEvents(events)
    console.groupEnd();
}

const analyzeRequest = (request) => {
    const requestBody = JSON.parse(request.postQuery);
    const xdm = requestBody?.events?.[0]?.xdm;
    const eventType = xdm?.eventType;
    const analytics = xdm?._experience?.analytics;
    if (analytics) {
        // console.log(analytics);

        let callType;
        if (eventType) {
            callType = getEventType(eventType);
        }

        const dimensions = {
            eVars: getEVars(analytics),
            hierarchies: getHierarchies(analytics),
            lists: getLists(analytics),
            props: getProps(analytics)
        }
        
        const events = getEvents(analytics);
        
        printAll(callType, dimensions, events);
    }
}