'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Check, Copy, ChevronDown } from 'lucide-react';
import { useCurrentAccount, useUpdateAccount } from '@/api';
import { Button, IconButton, Card, Spinner } from '@/components/atoms';
import { ImageCropper } from '@/components/molecules';
import { useCropper } from '@/hooks/useCropper';

export default function ProfileEditPage() {
    const router = useRouter();
    const { data: currentAccount, isLoading } = useCurrentAccount();
    const updateAccountMutation = useUpdateAccount();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [locked, setLocked] = useState(false);
    const [bot, setBot] = useState(false);
    const [discoverable, setDiscoverable] = useState(true);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [headerFile, setHeaderFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [headerPreview, setHeaderPreview] = useState<string | null>(null);
    const [cropperType, setCropperType] = useState<'avatar' | 'header' | null>(null);
    const { cropperImage, openCropper, closeCropper, handleCropComplete } = useCropper();

    // Profile metadata fields (up to 4)
    const [fields, setFields] = useState<Array<{ name: string; value: string; verified_at: string | null }>>([
        { name: '', value: '', verified_at: null },
        { name: '', value: '', verified_at: null },
        { name: '', value: '', verified_at: null },
        { name: '', value: '', verified_at: null },
    ]);


    const avatarInputRef = useRef<HTMLInputElement>(null);
    const headerInputRef = useRef<HTMLInputElement>(null);

    // Initialize form with current account data
    useEffect(() => {
        if (currentAccount) {
            setDisplayName(currentAccount.display_name);
            setBio(currentAccount.note.replace(/<[^>]*>/g, '')); // Strip HTML
            setLocked(currentAccount.locked);
            setBot(currentAccount.bot);
            setDiscoverable(currentAccount.discoverable ?? true);

            // Initialize fields from source (plain text) or fields (HTML)
            const sourceFields = currentAccount.source?.fields || currentAccount.fields || [];
            const initialFields: Array<{ name: string; value: string; verified_at: string | null }> = [
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
            ];
            sourceFields.forEach((field, index) => {
                if (index < 4) {
                    initialFields[index] = {
                        name: field.name || '',
                        // Use source.fields for plain text value, otherwise strip HTML
                        value: currentAccount.source?.fields?.[index]?.value || field.value.replace(/<[^>]*>/g, '') || '',
                        verified_at: currentAccount.fields?.[index]?.verified_at || null,
                    };
                }
            });
            setFields(initialFields);
        }
    }, [currentAccount]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && openCropper(file)) {
            setCropperType('avatar');
        }
        // Reset input to allow selecting the same file again
        e.target.value = '';
    };

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && openCropper(file)) {
            setCropperType('header');
        }
        // Reset input to allow selecting the same file again
        e.target.value = '';
    };

    const onCropComplete = (croppedFile: File) => {
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            const previewUrl = reader.result as string;
            if (cropperType === 'avatar') {
                setAvatarFile(croppedFile);
                setAvatarPreview(previewUrl);
            } else {
                setHeaderFile(croppedFile);
                setHeaderPreview(previewUrl);
            }
        };
        reader.readAsDataURL(croppedFile);
        setCropperType(null);
    };

    const onCropCancel = () => {
        closeCropper();
        setCropperType(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const params: Record<string, string | File | boolean | Array<{ name: string; value: string }>> = {};

        if (displayName !== currentAccount?.display_name) {
            params.display_name = displayName;
        }
        if (bio !== currentAccount?.note.replace(/<[^>]*>/g, '')) {
            params.note = bio;
        }
        if (locked !== currentAccount?.locked) {
            params.locked = locked;
        }
        if (bot !== currentAccount?.bot) {
            params.bot = bot;
        }
        if (discoverable !== (currentAccount?.discoverable ?? true)) {
            params.discoverable = discoverable;
        }
        if (avatarFile) {
            params.avatar = avatarFile;
        }
        if (headerFile) {
            params.header = headerFile;
        }

        // Add fields_attributes - filter out empty fields
        const fieldsToSubmit = fields
            .filter(f => f.name.trim() || f.value.trim())
            .map(f => ({ name: f.name, value: f.value }));
        params.fields_attributes = fieldsToSubmit;

        try {
            await updateAccountMutation.mutateAsync(params);
            router.push(`/@${currentAccount?.acct}`);
        } catch (error) {
            console.error('Failed to update account:', error);
        }
    };

    // Note: Auth protection is handled by middleware (proxy.ts)
    // Show loading state until account data is loaded
    if (isLoading || !currentAccount) {
        return (
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--size-4)' }}>
                {/* Header Skeleton */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-3)',
                    marginBottom: 'var(--size-5)',
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                    }} />
                    <div style={{
                        width: '120px',
                        height: '28px',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                    }} />
                </div>

                {/* Header Image & Avatar Skeleton */}
                <Card padding="none" style={{ marginBottom: 'var(--size-4)' }}>
                    <div style={{
                        width: '100%',
                        height: '200px',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                        borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: '-40px',
                            left: 'var(--size-4)',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'var(--surface-3)',
                            border: '4px solid var(--surface-1)',
                            animation: 'var(--animation-blink)',
                        }} />
                    </div>
                    <div style={{ padding: 'var(--size-4)', paddingTop: 'var(--size-8)' }} />
                </Card>

                {/* Profile Fields Skeleton */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <div style={{
                        width: '150px',
                        height: '24px',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                        marginBottom: 'var(--size-4)',
                    }} />
                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <div style={{
                            width: '100px',
                            height: '16px',
                            borderRadius: 'var(--radius-2)',
                            background: 'var(--surface-3)',
                            animation: 'var(--animation-blink)',
                            marginBottom: 'var(--size-2)',
                        }} />
                        <div style={{
                            width: '100%',
                            height: '40px',
                            borderRadius: 'var(--radius-2)',
                            background: 'var(--surface-3)',
                            animation: 'var(--animation-blink)',
                        }} />
                    </div>
                    <div>
                        <div style={{
                            width: '80px',
                            height: '16px',
                            borderRadius: 'var(--radius-2)',
                            background: 'var(--surface-3)',
                            animation: 'var(--animation-blink)',
                            marginBottom: 'var(--size-2)',
                        }} />
                        <div style={{
                            width: '100%',
                            height: '80px',
                            borderRadius: 'var(--radius-2)',
                            background: 'var(--surface-3)',
                            animation: 'var(--animation-blink)',
                        }} />
                    </div>
                </Card>

                {/* Extra Fields Skeleton */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <div style={{
                        width: '120px',
                        height: '24px',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                        marginBottom: 'var(--size-4)',
                    }} />
                    {[1, 2].map((i) => (
                        <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--size-2)',
                            marginBottom: 'var(--size-3)',
                        }}>
                            <div style={{
                                height: '40px',
                                borderRadius: 'var(--radius-2)',
                                background: 'var(--surface-3)',
                                animation: 'var(--animation-blink)',
                            }} />
                            <div style={{
                                height: '40px',
                                borderRadius: 'var(--radius-2)',
                                background: 'var(--surface-3)',
                                animation: 'var(--animation-blink)',
                            }} />
                        </div>
                    ))}
                </Card>

                {/* Action Buttons Skeleton */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--size-3)',
                    justifyContent: 'flex-end',
                }}>
                    <div style={{
                        width: '80px',
                        height: '40px',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                    }} />
                    <div style={{
                        width: '120px',
                        height: '40px',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-3)',
                        animation: 'var(--animation-blink)',
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--size-4)' }}>
            {/* Image Cropper Modal */}
            {cropperImage && (
                <ImageCropper
                    image={cropperImage}
                    onCropComplete={(blob) => handleCropComplete(blob, onCropComplete)}
                    onCancel={onCropCancel}
                    aspectRatio={cropperType === 'avatar' ? 1 : 16 / 9}
                />
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                marginBottom: 'var(--size-5)',
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <h1 style={{
                    fontSize: 'var(--font-size-4)',
                    fontWeight: 'var(--font-weight-6)',
                    color: 'var(--text-1)',
                }}>
                    Edit Profile
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Header Image */}
                <Card padding="none" style={{ marginBottom: 'var(--size-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <div
                            className="profile-header-image"
                            style={{
                                width: '100%',
                                height: '200px',
                                background: headerPreview
                                    ? `url(${headerPreview}) center/cover`
                                    : currentAccount.header
                                        ? `url(${currentAccount.header}) center/cover`
                                        : 'var(--surface-3)',
                                borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
                                position: 'relative',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 'var(--size-3)',
                                right: 'var(--size-3)',
                                display: 'flex',
                                gap: 'var(--size-2)',
                            }}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="small"
                                    onClick={() => headerInputRef.current?.click()}
                                >
                                    <Upload size={16} />
                                    Upload Header
                                </Button>
                                {(headerPreview || headerFile) && (
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setHeaderFile(null);
                                            setHeaderPreview(null);
                                        }}
                                    >
                                        <X size={16} />
                                    </IconButton>
                                )}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-40px',
                            left: 'var(--size-4)',
                        }}>
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        background: avatarPreview
                                            ? `url(${avatarPreview}) center/cover`
                                            : currentAccount.avatar
                                                ? `url(${currentAccount.avatar}) center/cover`
                                                : 'var(--surface-3)',
                                        border: '4px solid var(--surface-1)',
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="small"
                                    onClick={() => avatarInputRef.current?.click()}
                                    style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                    }}
                                >
                                    <Upload size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: 'var(--size-4)', paddingTop: 'var(--size-8)' }} />
                </Card>

                {/* Hidden file inputs */}
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                />
                <input
                    ref={headerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderChange}
                    style={{ display: 'none' }}
                />

                {/* Profile Fields */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 'var(--font-weight-6)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        Profile Information
                    </h2>

                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-1)',
                            fontWeight: 'var(--font-weight-6)',
                            marginBottom: 'var(--size-2)',
                            color: 'var(--text-1)',
                        }}>
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={30}
                            style={{
                                width: '100%',
                                padding: 'var(--size-2)',
                                border: '1px solid var(--surface-4)',
                                borderRadius: 'var(--radius-2)',
                                background: 'var(--surface-1)',
                                color: 'var(--text-1)',
                                fontSize: 'var(--font-size-1)',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-1)',
                            fontWeight: 'var(--font-weight-6)',
                            marginBottom: 'var(--size-2)',
                            color: 'var(--text-1)',
                        }}>
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={500}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: 'var(--size-2)',
                                border: '1px solid var(--surface-4)',
                                borderRadius: 'var(--radius-2)',
                                background: 'var(--surface-1)',
                                color: 'var(--text-1)',
                                fontSize: 'var(--font-size-1)',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                            }}
                        />
                        <div style={{
                            fontSize: 'var(--font-size-0)',
                            color: 'var(--text-2)',
                            marginTop: 'var(--size-1)',
                            textAlign: 'right',
                        }}>
                            {bio.length} / 500
                        </div>
                    </div>
                </Card>

                {/* Extra Fields */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 'var(--font-weight-6)',
                        marginBottom: 'var(--size-2)',
                    }}>
                        Extra Fields
                    </h2>
                    <p style={{
                        fontSize: 'var(--font-size-0)',
                        color: 'var(--text-2)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        You can have up to 4 items displayed as a table on your profile
                    </p>

                    <div className="profile-edit-fields-container">
                        {fields.map((field, index) => (
                            <div
                                key={index}
                                className="profile-edit-field-row"
                            >
                                <input
                                    type="text"
                                    placeholder={`Label ${index + 1}`}
                                    value={field.name}
                                    onChange={(e) => {
                                        const newFields = [...fields];
                                        newFields[index] = { ...newFields[index], name: e.target.value };
                                        setFields(newFields);
                                    }}
                                    style={{
                                        padding: 'var(--size-2)',
                                        border: '1px solid var(--surface-4)',
                                        borderRadius: 'var(--radius-2)',
                                        background: 'var(--surface-1)',
                                        color: 'var(--text-1)',
                                        fontSize: 'var(--font-size-1)',
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Content"
                                    value={field.value}
                                    onChange={(e) => {
                                        const newFields = [...fields];
                                        newFields[index] = { ...newFields[index], value: e.target.value };
                                        setFields(newFields);
                                    }}
                                    style={{
                                        padding: 'var(--size-2)',
                                        border: field.verified_at ? '1px solid var(--green-6)' : '1px solid var(--surface-4)',
                                        borderRadius: 'var(--radius-2)',
                                        background: field.verified_at ? 'color-mix(in srgb, var(--green-6) 10%, var(--surface-1))' : 'var(--surface-1)',
                                        color: 'var(--text-1)',
                                        fontSize: 'var(--font-size-1)',
                                    }}
                                />
                                <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                                    {field.verified_at && (
                                        <span title={`Verified on ${new Date(field.verified_at).toLocaleDateString()}`}>
                                            <Check
                                                size={18}
                                                style={{ color: 'var(--green-6)' }}
                                            />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Verification Info */}
                    <details style={{ marginTop: 'var(--size-4)', borderTop: '1px solid var(--surface-3)', paddingTop: 'var(--size-4)' }}>
                        <summary
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--size-2)',
                                color: 'var(--text-1)',
                                fontSize: 'var(--font-size-1)',
                                fontWeight: 'var(--font-weight-6)',
                                cursor: 'pointer',
                                listStyle: 'none',
                            }}
                        >
                            <ChevronDown size={18} className="details-chevron" />
                            Link Verification
                        </summary>

                        <div style={{ marginTop: 'var(--size-3)' }}>
                            <p style={{
                                fontSize: 'var(--font-size-0)',
                                color: 'var(--text-2)',
                                marginBottom: 'var(--size-3)',
                                lineHeight: 1.5,
                            }}>
                                You can verify yourself as the owner of the links in your profile metadata. For this, the linked website must contain a link back to your Mastodon profile. The link back must have a <code style={{ background: 'var(--surface-3)', padding: '2px 4px', borderRadius: '4px' }}>rel=&quot;me&quot;</code> attribute.
                            </p>

                            <div style={{
                                background: 'var(--surface-2)',
                                borderRadius: 'var(--radius-2)',
                                paddingBlock: 'var(--size-3)',
                                display: 'flex',
                                placeItems: 'center',
                            }}>
                                <code style={{
                                    fontSize: 'var(--font-size-0)',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                    paddingRight: 'var(--size-8)',
                                    overflow: 'auto',
                                }}>
                                    {`<a rel="me" href="${currentAccount?.url || ''}">Mastodon</a>`}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`<a rel="me" href="${currentAccount?.url || ''}">Mastodon</a>`);
                                    }}
                                    style={{
                                        background: 'var(--surface-3)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-1)',
                                        padding: 'var(--size-1)',
                                        cursor: 'pointer',
                                        color: 'var(--text-2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    title="Copy to clipboard"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>

                            <p style={{
                                fontSize: 'var(--font-size-0)',
                                color: 'var(--text-2)',
                                marginTop: 'var(--size-3)',
                                lineHeight: 1.5,
                            }}>
                                <strong>Tip:</strong> The link on your website can be invisible. The important part is <code style={{ background: 'var(--surface-3)', padding: '2px 4px', borderRadius: '4px' }}>rel=&quot;me&quot;</code> which prevents impersonation.
                            </p>
                        </div>
                    </details>
                </Card>

                {/* Privacy Settings */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 'var(--font-weight-6)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        Privacy & Preferences
                    </h2>

                    <div style={{ marginBottom: 'var(--size-3)' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-3)',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={locked}
                                onChange={(e) => setLocked(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                                    Locked Account
                                </div>
                                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                    Manually approve followers
                                </div>
                            </div>
                        </label>
                    </div>

                    <div style={{ marginBottom: 'var(--size-3)' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-3)',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={bot}
                                onChange={(e) => setBot(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                                    Bot Account
                                </div>
                                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                    This account mainly performs automated actions
                                </div>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-3)',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={discoverable}
                                onChange={(e) => setDiscoverable(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                                    Suggest Account to Others
                                </div>
                                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                    Allow your account to be discovered
                                </div>
                            </div>
                        </label>
                    </div>
                </Card>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--size-3)',
                    justifyContent: 'flex-end',
                }}>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={updateAccountMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={updateAccountMutation.isPending}
                        isLoading={updateAccountMutation.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
