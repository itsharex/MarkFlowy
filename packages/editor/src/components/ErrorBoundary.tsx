import type { ErrorInfo, PropsWithChildren } from 'react'
import React from 'react'
import styled from 'styled-components'

const Title = styled.h1`
    color: ${({ theme }) => theme.warnColor};
`

interface ErrorBoundaryProps {
  hasError?: boolean
  error?: unknown
}

class ErrorBoundary extends React.Component<
  PropsWithChildren<ErrorBoundaryProps>,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
    super(props)
    this.state = { hasError: this.props.hasError ?? false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Title data-testid='editor_error'>Sorry, something went wrong!</Title>
          <p>{String(this.props.error)}</p>
          <a
            href='https://github.com/linebyline-group/linebyline/issues/new/choose'
            target='_blank'
            rel='noreferrer'
          >
            Please tell us about it and we will fix it in less time
          </a>
        </>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary