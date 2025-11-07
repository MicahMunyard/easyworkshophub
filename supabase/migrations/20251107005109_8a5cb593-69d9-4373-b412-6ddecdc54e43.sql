-- Add business hours fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT NULL;

COMMENT ON COLUMN public.profiles.business_hours IS 'Stores workshop business hours including working days, open/close times, and slot duration from onboarding step 5';

-- Update process_onboarding_data function to handle business hours from step 5
CREATE OR REPLACE FUNCTION public.process_onboarding_data(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_onboarding_data jsonb;
  v_service jsonb;
  v_bay jsonb;
  v_technician jsonb;
  v_services_count integer := 0;
  v_bays_count integer := 0;
  v_technicians_count integer := 0;
  v_result jsonb;
BEGIN
  -- Get onboarding data
  SELECT onboarding_data INTO v_onboarding_data
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- If no onboarding data found, return early
  IF v_onboarding_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No onboarding data found'
    );
  END IF;

  -- Step 1: Update workshop details in profiles table
  BEGIN
    UPDATE public.profiles
    SET 
      workshop_name = COALESCE(v_onboarding_data->'step1'->>'workshopName', workshop_name),
      phone_number = COALESCE(v_onboarding_data->'step1'->>'phone', phone_number),
      company_address = COALESCE(v_onboarding_data->'step1'->>'address', company_address),
      email_reply_to = COALESCE(v_onboarding_data->'step1'->>'email', email_reply_to),
      -- Add business hours from step5
      business_hours = CASE 
        WHEN v_onboarding_data ? 'step5' THEN v_onboarding_data->'step5'
        ELSE business_hours
      END
    WHERE user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to update profile: %', SQLERRM;
  END;

  -- Step 2: Insert services from step2
  BEGIN
    IF v_onboarding_data ? 'step2' AND v_onboarding_data->'step2' ? 'services' THEN
      FOR v_service IN SELECT * FROM jsonb_array_elements(v_onboarding_data->'step2'->'services')
      LOOP
        INSERT INTO public.user_services (user_id, name, duration, price)
        VALUES (
          p_user_id,
          v_service->>'name',
          (v_service->>'duration')::integer,
          (v_service->>'price')::numeric
        )
        ON CONFLICT DO NOTHING;
        v_services_count := v_services_count + 1;
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to insert services: %', SQLERRM;
  END;

  -- Step 3: Insert service bays from step3
  BEGIN
    IF v_onboarding_data ? 'step3' AND v_onboarding_data->'step3' ? 'bays' THEN
      FOR v_bay IN SELECT * FROM jsonb_array_elements(v_onboarding_data->'step3'->'bays')
      LOOP
        INSERT INTO public.user_service_bays (user_id, name, type, equipment)
        VALUES (
          p_user_id,
          v_bay->>'name',
          COALESCE(v_bay->>'type', 'General'),
          v_bay->>'equipment'
        )
        ON CONFLICT DO NOTHING;
        v_bays_count := v_bays_count + 1;
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to insert service bays: %', SQLERRM;
  END;

  -- Step 4: Insert technicians from step4
  BEGIN
    IF v_onboarding_data ? 'step4' AND v_onboarding_data->'step4' ? 'technicians' THEN
      FOR v_technician IN SELECT * FROM jsonb_array_elements(v_onboarding_data->'step4'->'technicians')
      LOOP
        -- Only insert if technician has a name
        IF v_technician->>'name' IS NOT NULL AND trim(v_technician->>'name') != '' THEN
          INSERT INTO public.user_technicians (user_id, name, specialty, experience)
          VALUES (
            p_user_id,
            v_technician->>'name',
            v_technician->>'specialty',
            v_technician->>'experience'
          )
          ON CONFLICT DO NOTHING;
          v_technicians_count := v_technicians_count + 1;
        END IF;
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to insert technicians: %', SQLERRM;
  END;

  -- Return success with counts
  v_result := jsonb_build_object(
    'success', true,
    'services_created', v_services_count,
    'bays_created', v_bays_count,
    'technicians_created', v_technicians_count
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.process_onboarding_data(UUID) IS 
'Processes onboarding data and populates user_services, user_service_bays, and user_technicians tables. Also updates profile with workshop details including business hours. Called automatically when onboarding is completed.';