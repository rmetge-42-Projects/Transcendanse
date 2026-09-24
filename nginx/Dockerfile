FROM owasp/modsecurity-crs:nginx-alpine 

ENV ALLOWED_METHODS="GET HEAD POST OPTIONS PUT DELETE"

COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template

COPY transcendance.key transcendance.crt /etc/nginx/ssl/

EXPOSE 80
EXPOSE 443


