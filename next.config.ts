import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  env: {
    REACT_APP_SC_DISABLE_SPEEDY: 'false',
  },
}

export default nextConfig
