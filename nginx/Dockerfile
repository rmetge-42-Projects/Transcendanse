FROM owasp/modsecurity-crs:nginx-alpine

ENV ALLOWED_METHODS="GET HEAD POST OPTIONS PUT DELETE PATCH"

COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template

EXPOSE 80
EXPOSE 443
