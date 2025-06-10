"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUpAction(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate required fields
  if (!name || name.length < 2) {
    return {
      error: "Name must be at least 2 characters.",
    }
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return {
      error: "Please enter a valid email address.",
    }
  }

  if (!password || password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      throw error
    }

    return {
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
    }
  } catch (error: any) {
    return {
      error: error.message || "Failed to create account. Please try again.",
    }
  }
}

export async function signInAction(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate required fields
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return {
      error: "Please enter a valid email address.",
    }
  }

  if (!password || password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
    }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return {
      success: true,
      message: "Signed in successfully.",
    }
  } catch (error: any) {
    return {
      error: error.message || "Invalid login credentials. Please try again.",
    }
  }
}

export async function signOutAction() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Error signing out:", error)
  }

  redirect("/login")
}
