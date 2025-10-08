"use client"

import { Button, type ButtonProps } from "@nattui/react-components"
import { useRouter } from "next/navigation"
import { type MouseEvent, useState } from "react"
import { api } from "@/utils/api-client"

function ButtonSignOut(props: ButtonProps) {
  const { variant = "secondary", ...rest } = props
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await api["auth"].signout.$post() // typed RPC call
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.replace("/signin")
      router.refresh()
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      isDisabled={isLoading}
      isLoading={isLoading}
      onClick={onSubmit}
      variant={variant}
      {...rest}
    >
      Sign out
    </Button>
  )
}

export default ButtonSignOut
