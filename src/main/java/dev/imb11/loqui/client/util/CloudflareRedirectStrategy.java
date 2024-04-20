package dev.imb11.loqui.client.util;

import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.ProtocolException;
import org.apache.http.client.methods.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.apache.http.protocol.HttpContext;

import java.net.URI;

public class CloudflareRedirectStrategy extends LaxRedirectStrategy {

    private final StringEntity entity;

    public CloudflareRedirectStrategy(StringEntity entity) {
        this.entity = entity;
    }

    /*
     * (non-Javadoc)
     *
     * @see org.apache.http.impl.client.DefaultRedirectStrategy#
     * getRedirect(org.apache.http.HttpRequest,
     * org.apache.http.HttpResponse,
     * org.apache.http.protocol.HttpContext)
     */
    @Override
    public HttpUriRequest getRedirect(
            HttpRequest request, HttpResponse response,
            HttpContext context) throws ProtocolException {

        final URI uri = getLocationURI(request, response, context);
        final String method = request.getRequestLine().getMethod();
        if (method.equalsIgnoreCase(HttpPost.METHOD_NAME)) {

            HttpPost post = new HttpPost(uri);
            post.setEntity(entity);
            return post;
        } else if (method.equalsIgnoreCase(HttpHead.METHOD_NAME)) {
            return new HttpHead(uri);
        } else if (method.equalsIgnoreCase(HttpGet.METHOD_NAME)) {
            return new HttpGet(uri);
        } else {
            final int status =
                    response.getStatusLine().getStatusCode();
            return status == HttpStatus.SC_TEMPORARY_REDIRECT
                    ? RequestBuilder.copy(request).setUri(uri).build()
                    : new HttpGet(uri);
        }
    }

}
