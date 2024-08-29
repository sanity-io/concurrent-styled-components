import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  env: {
    SC_DISABLE_SPEEDY: 'false',
  },
}

export default nextConfig
