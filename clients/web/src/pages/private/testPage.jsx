import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { useError } from '../../provider/ErrorProvider'

import { RiColorFilterLine, RiFilter2Line, RiArrowDownDoubleFill } from "react-icons/ri";

const TestPage = () => {

    const [currentView, setCurrentView] = useState("stream");


    const ViewContainer = () => {
        return (
            <>
                
            </>
        )
    }

    const ButtonSwitchView = () => {
        return (
            <>
            
            </>
        )
    }

    const Stream = () => {
        return (
          <>
            <div className='w-full h-full flex flex-col justify-center items-center bg-secondary shadow-md rounded-xl pt-3 pb-3 pl-5 pr-5'>
                <div className='w-full h-full flex flex-row justify-between'>
                    <div className='w-full h-6 flex flex-row items-center;' style={{background:'#2C2E2C'}}>a</div>
                    <div className='w-full h-6 flex flex-row items-center;' style={{background:'red'}}>Местное время<span>18:05:45</span></div>
                    <div className='w-full h-6 flex flex-row items-center;' style={{background:'blue'}}>Адрес: Москва, ул.Гоголя, стр.32</div>
                </div>
                <div className='w-full h-6' style={{background:'#2C2E2C'}}>2</div>
                <div className='w-full h-6' style={{background:'#2C2E2C'}}>3</div>
            </div>
            <div className='w-full md:w-110 h-full flex flex-col justify-start items-center bg-accent shadow-md rounded-xl'>
                <div>Header</div>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
            </div>
          </>
        );
    };
      
    const Gantt = () => {
        return (
          <>
            <div>This is Gantt</div>
          </>
        );
    };

    const CardTask = () => {


        const dataUser = [
            {
                id: 1,
                username: 'fuze',
                fio: 'Радчук Георгий Владиславович',
            }
        ]

        const dataTask = [
            {
                id: 1,
                name: 'Заливка бетона',
                description: 'Поливаем значит сначала ноги в чашке с цементомdfgdfgdfgdfgdfgdfgdfgfdgdfgdfbfhdfgdfggd...',
                endTime: '07.05.2025',
                requirement: 'true',
                value: '1500',
                progress: '1000',
                executor: 'fuze',
                executorColor: '#FF63A6',
                level: 'Высокий',
            },
        ]

        const userChar = dataUser?.map((user, task) => {
            if (task.executor === user.username) {
                return userChar = user.fio.charAt(0).toUpperCase()
            }
            return (
                <>
                    <div key={user.id} className='w-7 h-7 flex column-center rounded-full' style={{background: `${task.executorColor}`, color: "white"}}>
                        <span>
                            {user.fio}
                        </span> 
                    </div>
                </>
            )
        })

        const formatFio = (fio) => {
            const parts = fio.split(' ');
            if (parts.length >= 3) {
                return `${parts[0]} ${parts[1].charAt(0)}.${parts[2].charAt(0)}.`;
            }
            return fio;
        };

        const fetchTask = dataTask.map((task) => {

            const user = dataUser.find((u) => u.username === task.executor);
            const formattedFio = user ? formatFio(user.fio) : 'Неизвестный';
    
            return (

            
                <div key={task.id} className="primaryBlock w-full h-90 flex flex-col justify-between items-left bg-base-200 pt-4 pb-4 pl-6 pr-6">
                
                </div>
            );
        });
    
        return (
            <div>
                {fetchTask}
            </div>
        );
    };

    return (
        <>
        <div className='wrapper bg-base-200 p-4 md:pt-10 md:pb-6 md:pl-30 md:pr-10'>   
            <div className="w-full h-full flex flex-col md:flex-row gap-6">

                <div className="w-full md:w-128 h-full flex flex-col gap-6">

                    {/* Block Task */}
                    <div className='w-full h-full flex flex-col gap-3 bg-base-100 shadow-md rounded-box md:pt-3 md:pb-5 md:pl-4 md:pr-7'>
                        <div className='w-full flex flex-row justify-between items-center'>
                            <h4>Задачи</h4>
                            <div>?</div>
                        </div>
                        <div className='w-full h-auto flex flex-row justify-start items-center gap-2'>
                            <div className='w-auto md:h-2 flex flex-row jusify-between items-center bg-base-200 shadow-sm rounded-box p-3'>
                                <span className='mr-2'>сортировка</span>
                                <RiColorFilterLine />
                            </div>
                            <div className='w-auto md:h-2 flex flex-row jusify-between items-center bg-base-200 shadow-sm rounded-box p-3'>
                                <span className='mr-2'>фильтры</span>
                                <RiFilter2Line />
                            </div>
                        </div>
                        <div className='w-full h-full flex flex-col gap-7'>
                            <CardTask />
                        </div>
                    </div>

                    {/* Block DailyReport */}
                    <div className='w-full h-full md:h-25 flex flex-row gap-6'>
                        <div className='w-full h-full bg-base-100 shadow-md rounded-box'>
                            <h6>Ежедневый отчёт:</h6>
                            <div>Отчёт_технадзор.pdf</div>
                        </div>
                        <div className='w-full h-full bg-base-100 shadow-md rounded-box'>
                            <h6>Еженедельный отчёт:</h6>
                            <div>Отчёт_технадзор.pdf</div>
                        </div>
                    </div>

                </div>
                
                <div className="flex-1 flex flex-col gap-10">

                    {/* Block Stream|Gantt */}
                    <div className="w-full h-full flex flex-col bg-base-100 shadow-md rounded-box md:pt-8 md:pb-5 md:pl-4 md:pr-4">
                        <div className='w-full h-10 md:h-10 flex flex-row items-end'>
                            <ButtonSwitchView />
                        </div>
                        <div className='w-full h-full flex flex-row gap-4'>
                            <ViewContainer />
                        </div>
                    </div>

                    {/* Block TaskFinances */}
                    <div className="w-full h-full md:h-170 flex flex-row gap-6">
                        <div className='w-full md:w-130 h-full flex flex-col gap-6'>
                            <div className='w-full h-28 flex flex-col justify-center items-left  bg-base-100 shadow-md rounded-box md:pt-10 md:pb-10 md:pl-16 md:pr-16'>
                                <h4>16 000 0000 ₽ </h4>
                                <div>Текущий бюджет</div>
                            </div>
                            <div className='w-full h-28 flex flex-col justify-center items-left bg-base-100 shadow-md rounded-box md:pt-10 md:pb-10 md:pl-16 md:pr-16'>
                                <h4>16 000 0000 ₽ </h4>
                                <div>Расходы</div>
                            </div>
                            <div className='w-full h-28 flex flex-col justify-center items-left bg-base-100 shadow-md rounded-box md:pt-10 md:pb-10 md:pl-16 md:pr-16'>
                                <h4>16 000 0000 ₽ </h4>
                                <div>Требуется</div>
                            </div>
                        </div>
                        <div className='w-full h-full flex flex-row justify-center items-center bg-base-100 shadow-md rounded-box'>

                            <div className='w-full h-full flex flex-col justify-center items-center'>                         
                                {/*<DonutChart />*/}
                            </div>

                        </div>
                    </div>
                    
                </div>

            </div>
        </div>
        </>
    )
}

export default TestPage