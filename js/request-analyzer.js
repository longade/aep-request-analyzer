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
    const hierarchies = analytics.customDimensions.hierarchies;
    let finalHierarchies = {};
    for (const [k, v] of Object.entries(hierarchies)) {
        const newHier = { [k]: { ...v, values: [...v.values].join(';') } }
        finalHierarchies = { ...finalHierarchies, ...newHier }
    }
    return finalHierarchies;
}

const getLists = (analytics) => {
    return Object.entries(analytics.customDimensions.lists)
        .filter(([key, value]) => value.list.length > 0)
        .map(([key, value]) => ({ name: key, values: value.list.map(el => el.value) }));
}

const getProps = (analytics) => {
    return Object.fromEntries(Object.entries(analytics.customDimensions.props).filter(([key, value]) => value));
}

const getSession = (analytics) => {
    const webPageDetails = analytics.session.web.webPageDetails;
    const webInteraction = analytics.session.web.webInteraction;
    return {
        webInteraction: {...webInteraction},
        webPageDetails: {...webPageDetails}
    }
}

const printDimensions = (dimensions) => {

    console.groupCollapsed('props');
    console.table(dimensions.props);
    console.groupEnd();

    console.groupCollapsed('eVars');
    console.table(dimensions.eVars);
    console.groupEnd();

    console.groupCollapsed('Hierarchies');
    Object.entries(dimensions.hierarchies).forEach(([key, value]) => {
        console.groupCollapsed(key);
        console.table(value);
        console.groupEnd();
    });
    console.groupEnd();

    if (dimensions.lists.length > 0) {
        console.groupCollapsed('Lists');
        dimensions.lists.forEach((list, index) => {
            console.groupCollapsed(list.name);
            console.table(list.values);
            console.groupEnd();
        });
        console.groupEnd();
    }

    console.groupCollapsed('Session');
    console.groupCollapsed('WebPageDetails');
    console.table(dimensions.session.webPageDetails);
    console.groupEnd();
    console.groupCollapsed('WebInteraction');
    console.table(dimensions.session.webInteraction);
    console.groupEnd();
    console.groupEnd();
}

const getEvents = (analytics) => {
    const allEvents = Object.fromEntries(Object.entries(analytics).filter(([key, value]) => key.startsWith('event')));
    let events = {};
    for (const event in allEvents) {
        events = { ...events, ...allEvents[event] };
    }
    return Object.fromEntries(Object.entries(events).filter(([key, value]) => value.value === 1));
}

const getProducts = (products) => {
    const finalProducts = [];
    products.forEach(product => {
        const finalProduct = {
            SKU: product.SKU,
            currencyCode: product.currencyCode,
            name: product.name,
            priceTotal: product.priceTotal,
            quantity: product.quantity
        }
        finalProducts.push(finalProduct);
    })
    return finalProducts;
}

const printProducts = (products) => {
    if (products.length > 0) {
        console.groupCollapsed('Products');
        products.forEach((product, index) => {
            console.groupCollapsed('Product ' + index);
            console.table(product);
            console.groupEnd();
        })
        console.groupEnd();
    }
}

const printEvents = (events) => {
    console.groupCollapsed('Events');
    console.table(events);
    console.groupEnd();
}

const printAll = (callType, dimensions, events, products) => {
    const color = callType === 'Page View' ? 'color: lightgreen; background: black' : 'color: yellow; background: black;'
    console.group('[AEP] Adobe Analytics call: %c' + callType, color);
    printDimensions(dimensions)
    printEvents(events)
    printProducts(products);
    console.groupEnd();
}

const analyzeRequest = (request) => {
    const requestBody = JSON.parse(request.postQuery);
    const xdm = requestBody?.events?.[0]?.xdm;
    const eventType = xdm?.eventType;
    const analytics = xdm?._experience?.analytics;
    if (!analytics) {
        return;
    }
    const productsListItems = xdm.productListItems || [];
    if (analytics) {

        let callType;
        if (eventType) {
            callType = getEventType(eventType);
        }

        const dimensions = {
            eVars: getEVars(analytics),
            hierarchies: getHierarchies(analytics),
            lists: getLists(analytics),
            props: getProps(analytics),
            session: getSession(analytics)
        }

        const events = getEvents(analytics);

        const products = getProducts(productsListItems);

        printAll(callType, dimensions, events, products);
    }
}