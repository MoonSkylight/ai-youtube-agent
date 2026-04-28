cookies: {
  getAll() {
    return request.cookies.getAll();
  },
  setAll(
    cookiesToSet: Array<{
      name: string;
      value: string;
      options?: Parameters<typeof response.cookies.set>[2];
    }>
  ) {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
  },
}