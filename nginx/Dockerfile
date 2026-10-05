FROM owasp/modsecurity-crs:nginx-alpine 

ENV ALLOWED_METHODS="GET HEAD POST OPTIONS PUT DELETE PATCH"

COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY modsecurity-custom.conf /etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

COPY transcendance.key transcendance.crt /etc/nginx/ssl/

EXPOSE 80
EXPOSE 443
