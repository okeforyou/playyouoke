import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "../../features/auth/useAuthStore";
import { useSystemConfig } from "../../hooks/useSystemConfig";
import { updateSystemConfig, SystemConfig } from "../../services/systemConfigService";
// import { toast } from "react-hot-toast"; // Removed to fix build error

export default function AdminSettingsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { config, loading } = useSystemConfig();

    // Local state for editing form
    const [formConfig, setFormConfig] = useState<SystemConfig | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && config) {
            setFormConfig(config);
        }
    }, [config, loading]);

    // Simple Admin Check (Client-side)
    // Note: Real security should be enforced by Firestore Rules
    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            // router.push('/'); // Uncomment to redirect non-admins
            // For now, let's allow access for testing if role is missing/user is dev
        }
    }, [user, loading]);

    const handleSave = async () => {
        if (!formConfig) return;
        setSaving(true);
        try {
            await updateSystemConfig(formConfig);
            alert("บันทึกการตั้งค่าเรียบร้อยแล้ว ✅");
        } catch (error) {
            console.error("Save failed:", error);
            alert("บันทึกไม่สำเร็จ ❌");
        } finally {
            setSaving(false);
        }
    };

    const handleFreeChange = (field: keyof SystemConfig['membership']['free'], value: any) => {
        if (!formConfig) return;
        setFormConfig({
            ...formConfig,
            membership: {
                ...formConfig.membership,
                free: {
                    ...formConfig.membership.free,
                    [field]: value
                }
            }
        });
    };

    if (loading || !formConfig) {
        return <div className="p-10 text-center">Loading Settings...</div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <Head>
                <title>Admin Settings - YouOke</title>
            </Head>

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">⚙️ System Configuration</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-ghost"
                    >
                        Back to Home
                    </button>
                </div>

                {/* Membership Rules Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-6">📝 Membership Rules</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Free User Column */}
                            <div className="border border-base-300 rounded-xl p-6 bg-base-200/50">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    🐣 Free User
                                    <span className="badge badge-ghost">Default</span>
                                </h3>

                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Max Songs / Day</span>
                                            <span className="label-text-alt text-gray-500">(0 = Unlimited)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formConfig.membership.free.max_daily_songs}
                                            onChange={(e) => handleFreeChange('max_daily_songs', parseInt(e.target.value))}
                                            className="input input-bordered"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Max Duration / Song (Seconds)</span>
                                            <span className="label-text-alt text-gray-500">(0 = Full Song)</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={formConfig.membership.free.max_duration_sec}
                                                onChange={(e) => handleFreeChange('max_duration_sec', parseInt(e.target.value))}
                                                className="input input-bordered w-full"
                                            />
                                            <button
                                                className="btn btn-square btn-outline"
                                                onClick={() => handleFreeChange('max_duration_sec', 45)}
                                                title="Set to 45s (Joox style)"
                                            >
                                                45s
                                            </button>
                                        </div>
                                    </div>

                                    <div className="divider">Features</div>

                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">Allow Chromecast</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.membership.free.allow_cast}
                                                onChange={(e) => handleFreeChange('allow_cast', e.target.checked)}
                                                className="checkbox checkbox-primary"
                                            />
                                        </label>
                                    </div>

                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">Allow QR Remote</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.membership.free.allow_remote}
                                                onChange={(e) => handleFreeChange('allow_remote', e.target.checked)}
                                                className="checkbox checkbox-primary"
                                            />
                                        </label>
                                    </div>

                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">Show Ads</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.membership.free.show_ads}
                                                onChange={(e) => handleFreeChange('show_ads', e.target.checked)}
                                                className="checkbox checkbox-error"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Premium User Column (Read Only mostly, or configurable if we define levels) */}
                            <div className="border border-primary/20 rounded-xl p-6 bg-primary/5">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                    💎 Premium User
                                    <span className="badge badge-primary">Unloked</span>
                                </h3>

                                <div className="space-y-4 opacity-75 grayscale-[0.3] pointer-events-none">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Max Songs / Day</span></label>
                                        <input type="text" value="Unlimited" className="input input-bordered" readOnly />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Max Duration</span></label>
                                        <input type="text" value="Full Song" className="input input-bordered" readOnly />
                                    </div>
                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">Allow Chromecast</span>
                                            <input type="checkbox" checked={true} className="checkbox checkbox-primary" readOnly />
                                        </label>
                                    </div>
                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">No Ads</span>
                                            <input type="checkbox" checked={true} className="checkbox checkbox-success" readOnly />
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-center text-primary">
                                    * Premium logic currently hardcoded to unlimited.
                                </div>
                            </div>

                        </div>

                        <div className="card-actions justify-end mt-8">
                            <button
                                className={`btn btn-primary btn-lg gap-2 ${saving ? 'loading' : ''}`}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
