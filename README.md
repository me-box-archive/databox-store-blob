[![Build Status](https://travis-ci.org/me-box/databox-store-blob.svg?branch=master)](https://travis-ci.org/me-box/databox-store-blob)

# databox-store-blob

Databox Store for JSON data blobs handles time series and key value data.

The datastore exposes an HTTP-based API on port 8080 and a WebSocket based API
for live data. All requests must have arbiter tokens passed as per section 7.1
of the
[Hypercat 3.0 specs](https://shop.bsigroup.com/upload/276605/PAS212-corr.pdf).


## Read API

### Time series data
    URL: /<datasourceid>/ts/latest
    Method: GET
    Parameters: <datasourceid> the datasourceid to get data for.
    Notes: will return the latest data based on the datasourceid

    URL: /<datasourceid>/ts/since
    Method: GET
    URL Parameters: <datasourceid> the datasourceid to get data for.
    Body Parameters: <startTimestamp> the timestamp in ms to return records after.
    Notes: will return the all data since the provided timestamp for the provided datasourceid

    URL: /<datasourceid>/range
    Method: GET
    URL Parameters: <datasourceid> the datasourceid to get data for
    Body Parameters: <startTimestamp> and <endTimestamp> for the range.
    Notes: will return the all data between the provided start and end timestamps for the provided datasourceid.

### Key value pairs

    URL: /<key>/kv/
    Method: GET
    Parameters: replace <key> with document key
    Notes: will return the data stored with that key. Returns an empty array 404 {status:404,error:"Document not found."} if no data is stored

### Websockets

Connect to a websocket client to `/ws`. Then subscribe for data using:

    For time serries:

    URL: /sub/<datasourceid>/ts
    Method: GET
    Parameters: replace <datasourceid> with datasourceid
    Notes: Will broadcast over the websocket the data stored by datasourceid when data is added.


    For key value:

    URL: /sub/<key>/kv
    Method: GET
    Parameters: replace <key> with document key
    Notes:  Will broadcast over the websocket the data stored with that key when it is add or updated.

## Write API

### Managing the data source catalog
    URL: /cat
    Method: POST
    Parameters: Raw JSON body containing a Hypercat item (as per PAS212 (https://shop.bsigroup.com/upload/276605/PAS212-corr.pdf) Table 2).
    For example:
    {
        "item-metadata": [{
                // NOTE: Required
                "rel": "urn:X-hypercat:rels:hasDescription:en",
                "val": "Test item"
            }, {
                // NOTE: Required
                "rel": "urn:X-hypercat:rels:isContentType",
                "val": "text/plain"
            }, {
                "rel": "urn:X-databox:rels:hasVendor",
                "val": "Databox Inc."
            }, {
                "rel": "urn:X-databox:rels:hasType",
                "val": "Test"
            }, {
                "rel": "urn:X-databox:rels:hasDatasourceid",
                "val": "MyLongId"
            }, {
                "rel": "urn:X-databox:rels:isActuator",
                "val": false
            }, {
                "rel": "urn:X-databox:rels:hasStoreType",
                "val": "databox-store-blob"
            }
        ],
        "href": "https://databox-store-blob:8080"
    }

### Time series data
    URL: /<datasourceid>/ts/
    Method: POST
    Parameters: Raw JSON body containing elements as follows {data: <json blob to store>}
    Notes: Stores a value a timestamp is added on insertion

### Key value pairs

    URL: /<key>/kv/
    Method: POST
    Parameters: Raw JSON body containing elements as follows {<data to be stored in JSON format>}
    Notes: will insert if the <key> is not in the database and update the document if it is.


### Websockets

Not available for writing

## Arbiter Facing

### The data source catalog

    URL: /cat
    Method: GET
    Parameters: none
    Notes: will return the latest data source catalog in Hypercat format.

## Status

This is beta. Expect bugs but the API should be reasonably stable.

#Building running

    npm install && npm start

## Developing

Start the container manger in developer mode:

    DATABOX_DEV=1 npm start

Clone the repo and make your changes. To build a new Databox image and push it
to you local registry:

    npm run build && npm run deploy

Then restart the container manger to use you updated version.

## Testing

    npm install --development
    NO_SECURITY=1 NO_LOGGING=1 npm test
