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
      __VERSION__: '6.1.13',
    },
  },
}

export default nextConfig
