import path from 'path'


export default {
  getRoutes: async () => {
    return []
  },
  plugins: [
    [
      require.resolve('react-static-plugin-source-filesystem'),
      {
        location: path.resolve('./src/pages'),
      },
    ],
    require.resolve('react-static-plugin-reach-router'),

    // Works with or without SVG loading magic.
    // Comment / uncomment the next line to test.
    //require.resolve('react-static-plugin-svg'),
  ],
}
