import Header from "../../components/limbs/header";

const Public = () => {
    return (
        <>
            <Header />
            <div className="wrapper">
                <div className="min-h-screen bg-base-200 flex items-center justify-center">
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h1 className="text-2xl font-bold">Public Page</h1>
                        <p className="mt-2">This is a public page accessible to all.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Public;