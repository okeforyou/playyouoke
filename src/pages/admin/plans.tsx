import { useEffect, useState } from "react";
import Head from "next/head";
import AdminLayout from "../../layouts/AdminLayout";
import { useSystemConfig } from "../../hooks/useSystemConfig";
import { updateSystemConfig, SystemConfig } from "../../services/systemConfigService";
import { Shield, Zap, Radio, Globe, Tv, Check } from "lucide-react";

export default function AdminPlansPage() {
    const { config, loading } = useSystemConfig();
    const [formConfig, setFormConfig] = useState<SystemConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (!loading && config) {
            setFormConfig(config);
        }
    }, [config, loading]);

    const handleSave = async () => {
        if (!formConfig) return;
        setSaving(true);
        try {
            await updateSystemConfig(formConfig);
            setSuccessMsg("Configuration saved successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error) {
            console.error("Failed to save config:", error);
            alert("Failed to save settings");
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

    // Skeleton Loader
    if (loading || !formConfig) {
        return (
            <AdminLayout headerTitle="Plan Configuration">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-200 rounded"></div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout headerTitle="Plan Configuration">
            <Head>
                <title>Plans - YouOke Admin</title>
            </Head>

            {/* Header / Success Toast */}
            {successMsg && (
                <div className="fixed top-24 right-8 z-50 bg-success text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right">
                    <Check size={20} />
                    {successMsg}
                </div>
            )}

            <div className="mb-6 bg-white border border-stroke p-4 rounded-sm shadow-default flex items-center gap-4 text-boxdark">
                <Shield className="text-primary" />
                <div>
                    <h3 className="font-bold">Membership Access Rules</h3>
                    <p className="text-sm text-body">Configure what Free users can do vs Premium. Changes apply immediately.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Free Tier Editor */}
                <div className="rounded-sm border border-stroke bg-white shadow-default">
                    <div className="border-b border-stroke py-4 px-6.5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-50 rounded text-warning">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-bold text-boxdark">Free Tier Configuration</h3>
                            <span className="text-xs bg-gray text-body px-2 py-1 rounded ml-auto">Default</span>
                        </div>
                    </div>

                    <div className="p-6.5 space-y-6">
                        {/* Limits Group */}
                        <div>
                            <label className="mb-2.5 block text-black dark:text-white font-semibold">
                                Usage Limits
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="mb-1 block text-sm text-body">Max Songs/Day (0 = Unlimited)</span>
                                    <input
                                        type="number"
                                        value={formConfig.membership.free.max_daily_songs}
                                        onChange={(e) => handleFreeChange('max_daily_songs', parseInt(e.target.value))}
                                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <span className="mb-1 block text-sm text-body">Max Duration (s) per song</span>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formConfig.membership.free.max_duration_sec}
                                            onChange={(e) => handleFreeChange('max_duration_sec', parseInt(e.target.value))}
                                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none transition-colors"
                                        />
                                        <span className="absolute right-4 top-3 text-sm font-bold text-body opacity-50">SEC</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Toggles Group */}
                        <div>
                            <label className="mb-2.5 block text-black dark:text-white font-semibold pt-4 border-t border-stroke">
                                Feature Access
                            </label>
                            <div className="space-y-4">
                                {/* Chromecast */}
                                <div className="flex items-center justify-between p-3 bg-gray rounded-sm border border-transparent hover:border-stroke transition-all">
                                    <div className="flex items-center gap-3">
                                        <Tv size={18} className="text-body" />
                                        <div>
                                            <p className="font-medium text-black">Allow Chromecast</p>
                                            <p className="text-xs text-body">Cast to Big Screen</p>
                                        </div>
                                    </div>
                                    <label className="flex cursor-pointer select-none items-center">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formConfig.membership.free.allow_cast}
                                                onChange={(e) => handleFreeChange('allow_cast', e.target.checked)}
                                            />
                                            <div className={`block h-8 w-14 rounded-full ${formConfig.membership.free.allow_cast ? 'bg-primary' : 'bg-bodydark1'}`}></div>
                                            <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${formConfig.membership.free.allow_cast ? '!translate-x-full !bg-white' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>

                                {/* Remote */}
                                <div className="flex items-center justify-between p-3 bg-gray rounded-sm border border-transparent hover:border-stroke transition-all">
                                    <div className="flex items-center gap-3">
                                        <Globe size={18} className="text-body" />
                                        <div>
                                            <p className="font-medium text-black">Allow Remote</p>
                                            <p className="text-xs text-body">Use Phone as Remote</p>
                                        </div>
                                    </div>
                                    <label className="flex cursor-pointer select-none items-center">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formConfig.membership.free.allow_remote}
                                                onChange={(e) => handleFreeChange('allow_remote', e.target.checked)}
                                            />
                                            <div className={`block h-8 w-14 rounded-full ${formConfig.membership.free.allow_remote ? 'bg-primary' : 'bg-bodydark1'}`}></div>
                                            <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${formConfig.membership.free.allow_remote ? '!translate-x-full !bg-white' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Teaser / Future VVIP */}
                <div className="rounded-sm border border-stroke bg-gradient-to-br from-primary to-[#70b1e3] text-white shadow-default h-full flex flex-col">
                    <div className="border-b border-white/10 py-4 px-6.5">
                        <div className="flex items-center gap-2">
                            <Shield size={20} className="text-white" />
                            <h3 className="font-bold text-white">VVIP & Premium</h3>
                        </div>
                    </div>
                    <div className="p-6.5 flex-1">
                        <p className="mb-6 text-white/90">Premium tiers are currently <strong>Unlocked (Unlimited)</strong> by default until the payment gateway is fully integrated.</p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 opacity-60">
                                <Radio size={16} />
                                <span>Unlimited Songs</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-60">
                                <Shield size={16} />
                                <span>No Ads</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-60">
                                <Zap size={16} />
                                <span>Fast Queue</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6.5 mt-auto">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex w-full justify-center rounded bg-white p-3 font-medium text-primary hover:bg-opacity-90 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'SAVE CONFIGURATION'}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
