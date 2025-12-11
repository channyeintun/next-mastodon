'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useCurrentAccount, useUpdateAccount } from '@/api';
import { Button, IconButton } from '@/components/atoms';
import {
    ImageCropper,
    ProfileEditorSkeleton,
    ProfileImageUploader,
    ProfileFieldsEditor,
    PrivacySettingsForm,
} from '@/components/molecules';
import { useCropper } from '@/hooks/useCropper';
import { profileFormSchema, type ProfileFormData, type ProfileField } from '@/schemas/profileFormSchema';

export default function ProfileEditPage() {
    const router = useRouter();
    const { data: currentAccount, isLoading } = useCurrentAccount();
    const updateAccountMutation = useUpdateAccount();
    const [cropperType, setCropperType] = useState<'avatar' | 'header' | null>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: '',
            bio: '',
            locked: false,
            bot: false,
            discoverable: true,
            fields: [
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
            ],
            avatarFile: undefined,
            headerFile: undefined,
        },
    });

    const { cropperImage, openCropper, closeCropper, handleCropComplete } = useCropper();

    // Initialize form with current account data
    useEffect(() => {
        if (currentAccount) {
            const sourceFields = currentAccount.source?.fields || currentAccount.fields || [];
            const initialFields: ProfileField[] = [
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
                { name: '', value: '', verified_at: null },
            ];
            sourceFields.forEach((field, index) => {
                if (index < 4) {
                    initialFields[index] = {
                        name: field.name || '',
                        value: currentAccount.source?.fields?.[index]?.value || field.value.replace(/<[^>]*>/g, '') || '',
                        verified_at: currentAccount.fields?.[index]?.verified_at || null,
                    };
                }
            });

            reset({
                displayName: currentAccount.display_name,
                bio: currentAccount.note.replace(/<[^>]*>/g, ''),
                locked: currentAccount.locked,
                bot: currentAccount.bot,
                discoverable: currentAccount.discoverable ?? true,
                fields: initialFields,
                avatarFile: undefined,
                headerFile: undefined,
            });
        }
    }, [currentAccount, reset]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && openCropper(file)) {
            setCropperType('avatar');
        }
        e.target.value = '';
    };

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && openCropper(file)) {
            setCropperType('header');
        }
        e.target.value = '';
    };

    const onCropComplete = (croppedFile: File) => {
        if (cropperType === 'avatar') {
            setValue('avatarFile', croppedFile);
        } else {
            setValue('headerFile', croppedFile);
        }
        setCropperType(null);
    };

    const onCropCancel = () => {
        closeCropper();
        setCropperType(null);
    };

    const onSubmit = async (data: ProfileFormData) => {
        const params: Record<string, string | File | boolean | Array<{ name: string; value: string }>> = {};

        if (data.displayName !== currentAccount?.display_name) {
            params.display_name = data.displayName;
        }
        if (data.bio !== currentAccount?.note.replace(/<[^>]*>/g, '')) {
            params.note = data.bio;
        }
        if (data.locked !== currentAccount?.locked) {
            params.locked = data.locked;
        }
        if (data.bot !== currentAccount?.bot) {
            params.bot = data.bot;
        }
        if (data.discoverable !== (currentAccount?.discoverable ?? true)) {
            params.discoverable = data.discoverable;
        }
        if (data.avatarFile) {
            params.avatar = data.avatarFile;
        }
        if (data.headerFile) {
            params.header = data.headerFile;
        }

        const fieldsToSubmit = data.fields
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

    if (isLoading || !currentAccount) {
        return <ProfileEditorSkeleton />;
    }

    const avatarFile = watch('avatarFile');
    const headerFile = watch('headerFile');
    const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : null;
    const headerPreview = headerFile ? URL.createObjectURL(headerFile) : null;

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

            <form onSubmit={handleSubmit(onSubmit)}>
                <ProfileImageUploader
                    currentAccount={currentAccount}
                    avatarPreview={avatarPreview}
                    headerPreview={headerPreview}
                    onAvatarChange={handleAvatarChange}
                    onHeaderChange={handleHeaderChange}
                    onRemoveHeader={() => {
                        setValue('headerFile', undefined);
                    }}
                />

                <ProfileFieldsEditor
                    register={register}
                    control={control}
                    errors={errors}
                    watch={watch}
                    profileUrl={currentAccount.url || ''}
                />

                <PrivacySettingsForm control={control} />

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
