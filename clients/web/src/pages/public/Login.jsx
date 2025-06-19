import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider'

import { motion } from "framer-motion";

import { useError } from '../../provider/ErrorProvider';
import { getLoginErrorMessage } from '../../components/error/ErrorHander/ErrorHandler';

const Login = () => {

    const { login, isLoading } = useAuth()
    const { setErrorAutoClose } = useError()
    const [rememberMe, setRememberMe] = useState(false)
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
    
        try {
            const result = await login(formData, rememberMe)

            if (result.success) {
                setErrorAutoClose('Вход выполнен успешно!', 'success', 2000)
                setTimeout(() => navigate('/projects'), 2000)
            } else {
                const errorMessage = getLoginErrorMessage(result.error)
                setErrorAutoClose(errorMessage, 'error', 5000)
            }
        } catch (err) {
            const errorMessage = getLoginErrorMessage(err)
            setErrorAutoClose(errorMessage, 'error', 5000)
            console.error('Login error:', err)
        }
    }

    return (
        <>
            <div className="wrapper flex column-center text-base-100">
                <div className="flex w-full min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                   
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img className="mx-auto h-10 w-auto" src="./buildFlow.png" alt="buildFlow" />
                        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                            Sign in
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                       
                        <form noValidate onSubmit={handleSubmit} method="POST" className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                    Login
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="username"
                                        name="username"
                                        placeholder="Username"
                                        type="text"
                                        autoComplete="username"
                                        className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" 
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        Password
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input 
                                        id="password" 
                                        name="password" 
                                        placeholder="Password"
                                        type="password"
                                        autoComplete="current-password"   
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" 
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    title="Required"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="checkbox validator h-4 w-4 text-base-100 focus:ring-blue-500 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Запомнить меня
                                </label>
                            </div>
                            <motion.button  
                                initial={{ scale: 0 }}  
                                animate={{ scale: 1 }} 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"  
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Выполняется вход...' : 'Войти'}
                            </motion.button>
                        </form>



                        <p className="mt-10 text-center text-sm/6 text-gray-500">
                            Not a member?<br />
                            <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">Register NOW!!!</a>
                        </p>

                    </div>
                </div>
            </div>
        </>
    )
}
export default Login