import { useEffect, useState } from "react";
import Head from "next/head";
import AdminLayout from "../../layouts/AdminLayout";
import { useSystemConfig } from "../../hooks/useSystemConfig";
import { updateSystemConfig, SystemConfig } from "../../services/systemConfigService";
import { Shield, Zap, Radio, Globe, Tv, Clock, Music } from "lucide-react";

export default function AdminPlansPage() {
    const { config, loading } = useSystemConfig();
    const [formConfig, setFormConfig] = useState<SystemConfig | null>(null);
    const [saving, setSaving] = useState(false);

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
            alert("Configuration Saved Successfully ✅");
        } catch (error) {
            console.error("Save failed:", error);
            alert("Save Failed ❌");
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
        return (
            <AdminLayout>
                <div className="flex h-96 items-center justify-center">
                    <span className="loading loading-bars loading-lg text-primary"></span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout headerTitle="Plan Configuration">
            <Head>
                <title>Plans - YouOke Admin</title>
            </Head>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Intro Card */}
                <div className="xl:col-span-2">
                    <div className="alert bg-base-100 shadow-lg border border-base-200">
                        <Shield className="stroke-primary" />
                        <div>
                            <h3 className="font-bold">Membership Access Rules</h3>
                            <div className="text-xs">Configure what Free users can do vs Premium. Changes apply immediately.</div>
                        </div>
                    </div>
                </div>

                {/* Free Tier Editor */}
                <div className="card bg-base-100 shadow-xl border border-warning/20">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="card-title text-2xl flex items-center gap-2">
                                <div className="p-2 bg-warning/10 rounded-lg">
                                    <Zap className="text-warning" size={24} />
                                </div>
                                Free Tier
                            </h2>
                            <div className="badge badge-outline">Default</div>
                        </div>

                        <div className="space-y-6">
                            {/* Limits Section */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-3">Hard Limits</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control bg-base-200 p-3 rounded-lg">
                                        <label className="label">
                                            <span className="label-text font-bold flex items-center gap-2">
                                                <Music size={14} /> Max Songs/Day
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formConfig.membership.free.max_daily_songs}
                                            onChange={(e) => handleFreeChange('max_daily_songs', parseInt(e.target.value))}
                                            className="input input-bordered input-sm"
                                        />
                                        <label className="label">
                                            <span className="label-text-alt text-base-content/50">0 = Unlimited</span>
                                        </label>
                                    </div>

                                    <div className="form-control bg-base-200 p-3 rounded-lg">
                                        <label className="label">
                                            <span className="label-text font-bold flex items-center gap-2">
                                                <Clock size={14} /> Max Duration (s)
                                            </span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={formConfig.membership.free.max_duration_sec}
                                                onChange={(e) => handleFreeChange('max_duration_sec', parseInt(e.target.value))}
                                                className="input input-bordered input-sm w-full"
                                            />
                                            <button
                                                onClick={() => handleFreeChange('max_duration_sec', 45)}
                                                className="btn btn-xs btn-outline"
                                            >45s</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="divider"></div>

                            {/* Features Section */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-3">Feature Toggles</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-200/80 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-base-100 rounded-md"><Tv size={16} /></div>
                                            <div>
                                                <div className="font-bold text-sm">Allow Chromecast</div>
                                                <div className="text-xs opacity-60">Cast to Big Screen</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-success"
                                            checked={formConfig.membership.free.allow_cast}
                                            onChange={(e) => handleFreeChange('allow_cast', e.target.checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-200/80 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-base-100 rounded-md"><Radio size={16} /></div>
                                            <div>
                                                <div className="font-bold text-sm">Allow Remote</div>
                                                <div className="text-xs opacity-60">Use Phone as Remote</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-success"
                                            checked={formConfig.membership.free.allow_remote}
                                            onChange={(e) => handleFreeChange('allow_remote', e.target.checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-200/80 transition-colors border border-red-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-base-100 rounded-md"><Globe size={16} className="text-red-500" /></div>
                                            <div>
                                                <div className="font-bold text-sm text-red-500">Show Ads</div>
                                                <div className="text-xs opacity-60">Display Banner/Video Ads</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-error"
                                            checked={formConfig.membership.free.show_ads}
                                            onChange={(e) => handleFreeChange('show_ads', e.target.checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Teaser (Placeholder for VVIP logic) */}
                <div className="card bg-gradient-to-br from-primary to-purple-800 text-primary-content shadow-xl shadow-primary/20">
                    <div className="card-body">
                        <h2 className="card-title text-2xl flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Shield className="text-white" size={24} />
                            </div>
                            VVIP & Premium
                        </h2>
                        <p className="opacity-80 mt-4">Premium tiers are currently <b>Unlocked (Unlimited)</b> by default.</p>

                        <div className="mt-8 space-y-2">
                            <div className="flex items-center gap-2 opacity-50"><Shield size={16} /> Unlimited Songs</div>
                            <div className="flex items-center gap-2 opacity-50"><Shield size={16} /> No Ads</div>
                            <div className="flex items-center gap-2 opacity-50"><Shield size={16} /> Exclusive Badges</div>
                        </div>

                        <div className="card-actions justify-end mt-auto">
                            <button className="btn btn-sm btn-outline text-white border-white/40 hover:bg-white hover:text-primary hover:border-white">Configure Premium (Coming Soon)</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className={`fixed bottom-6 right-6 transition-all duration-300 transform ${saving ? 'translate-y-2' : ''}`}>
                <button
                    onClick={handleSave}
                    className={`btn btn-primary shadow-2xl gap-2 px-8 ${saving ? 'loading' : ''}`}
                >
                    {saving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            </div>
        </AdminLayout>
    );
}
