/** You can edit this variable to change KV Name Binding */
const KV_NAMESPACE = KVDB;

/** This variable with access tokens */
const tokens = JSON.parse(ACCESS_TOKENS)


/**
 * Handle the request
 * @param {Request} request
 */
async function handleRequest(request) {
    try {
        /** @type {string} Path of the request */
        const path = new URL(request.url).pathname;

        /** Handle common requests */
        switch (request.method) {
            case "GET": {
                /**  Handle GET / */
                if (path === "/") {
                    return jsonResponse({
                        data: {
                            status: true,
                            msg: "running",
                        },
                    });
                }
            }
            case "OPTIONS": {
                /**  Handle Preflight */
                return jsonResponse({
                    data: {
                        status: true,
                        msg: "preflight request success"
                    },
                });
            }
        }

        /** @type {string} Access token */
        const token = request.headers.get("token");
        /** Check if the token is valid */
        if (!tokens.includes(token)) {
            return jsonResponse({
                data: {
                    status: false,
                    error: "invalid token"
                },
                status: 401
            });
        }

        /** @type {string} Key for value */
        const key = token + path;

        if (key.length > 512) {
            return jsonResponse({
                data: {
                    status: false,
                    error: "key is too long"
                },
                status: 400
            });
        }

        switch (request.method) {
            case "GET": {
                /**  Handle GET keys */

                /** @type {object} Retrive payload from ID */
                var getData = await KV_NAMESPACE.get(key);
                if (getData) {
                    return jsonResponse({
                        data: JSON.parse(getData),
                    });
                } else {
                    return jsonResponse({
                        data: {
                            status: false,
                            error: "not found",
                        },
                        status: 404,
                    });
                }
            }
            case "POST":
            case "PUT": {
                /**  Handle POST/PUT */

                /** @type {object} Request payload */
                var payload = await request.json();

                /** @type {number} Number of seconds from the current time */
                const ttl = new URL(request.url).searchParams.get("ttl");

                if (ttl) {
                    await KV_NAMESPACE.put(key, JSON.stringify(payload), { expirationTtl: ttl });
                } else {
                    await KV_NAMESPACE.put(key, JSON.stringify(payload));
                }

                /**  Send response */
                return jsonResponse({
                    data: {
                        status: true,
                        msg: 'updated',
                        ttl: ttl,
                    },
                });
            }
            case "DELETE": {
                /**  Handle DELETE */

                await KV_NAMESPACE.delete(key);
                return jsonResponse({
                    data: {
                        status: true,
                        msg: "deleted",
                    },
                });
            }
            default: {
                /**  Handle unknown request */
                throw new Error("Invalid request method");
            }
        }
    } catch (error) {
        return jsonResponse({
            data: { status: false, error: error.message },
            status: 500,
        });
    }
}

/**
 * Send a JSON response to the client
 *
 * @param {object} obj - Response
 * @param {any} obj.data - Body of the response
 * @param {number} obj.status - Status code of the response
 * @param {object} obj.headers - Headers of the response
 * @returns {Response}
 */
function jsonResponse({ data = null, status = 200, headers = {} }) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Max-Age": "86400",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            ...headers,
        },
    });
}


addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});
