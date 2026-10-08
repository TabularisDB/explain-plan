import styles from './PlanLoading.module.scss';

export function PlanLoading() {
    return (
        <div className={styles.planLoading} role="status">
            <span className={styles.planLoadingLogo} />
            <p className={styles.planLoadingText}>Loading the plan</p>
        </div>
    );
}
