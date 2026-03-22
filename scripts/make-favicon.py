import base64

b = 'AAABAAEAEBAAAAAAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAP///wAAACH5BAEAAAEALAAAAAABAAEAAAICRAEAOw=='
bytes_ = base64.b64decode(b)
with open('apps/admin-frontend/public/favicon.ico','wb') as f:
    f.write(bytes_)
with open('apps/user-frontend/public/favicon.ico','wb') as f:
    f.write(bytes_)
print('favicon created in both frontends')
