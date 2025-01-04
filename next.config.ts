import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  env: {
    SC_DISABLE_SPEEDY: 'false',
  },
  compiler: {
    define: {
      __VERSION__: '6.1.14',
      // False, as we're not testing server APIs here that are exposed on non-browser exports
      __SERVER__: 'false',
    },
  },
}

export default nextConfig
