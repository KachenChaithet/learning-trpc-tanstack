"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    email: z.email("Please enter a vaild email address"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ['confirmPassword']
})

type RegisterFormValues = z.infer<typeof registerSchema>

const RegisterForm = () => {
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    })
    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email({
            name: values.name,
            email: values.email,
            password: values.password,
            callbackURL: "/",
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (ctx) => {
                console.log(ctx.error.message);

            }
        }

        )
    }



    const isPending = form.formState.isSubmitting


    const signinWithGithub = async () => {
        await authClient.signIn.social({
            callbackURL: "/",
            provider: 'github'
        })
    }
    const signinWithGoogle = async () => {
        await authClient.signIn.social({
            callbackURL: "/",
            provider: 'google'
        })
    }
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started
                    </CardTitle>
                    <CardDescription>
                        Create your account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>

                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">

                                    <Button
                                        onClick={signinWithGithub}
                                        variant={'outline'}
                                        className="w-full border rounded-md p-2 flex items-center justify-center gap-2 "
                                        type="button"
                                    >
                                        <Image src="/logos/github.svg" alt="github" width={20} height={20} />
                                        Continue with Github
                                    </Button>

                                    <Button
                                        onClick={signinWithGoogle}
                                        variant={'outline'}
                                        className="w-full border rounded-md p-2 flex items-center justify-center gap-2"
                                        type="button"
                                    >
                                        <Image src="/logos/google.svg" alt="google" width={20} height={20} />
                                        Continue with Google
                                    </Button>

                                    <div className="grid gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="john doe"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="m@example.com"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="********"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="********"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500" />
                                                </FormItem>
                                            )}
                                        />


                                        <Button
                                            type="submit"
                                            className="w-full "
                                            disabled={isPending}
                                        >
                                            Sign Up
                                        </Button>
                                    </div>

                                    <div className="text-center text-sm">
                                        Already have an account?{" "}
                                        <Link href="/login" className="underline">
                                            Login
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        </form>
                    </Form>

                </CardContent>
            </Card>
        </div >
    )
}
export default RegisterForm