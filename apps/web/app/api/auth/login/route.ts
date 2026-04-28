cookies: {
  getAll() {
    return request.cookies.getAll();
  },
  setAll(
    cookiesToSet: Array<{
      name: string;
      value: string;
      options?: any;
    }>
  ) {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
  },
},